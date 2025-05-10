import { ENV } from "@/constants/env";
import { ErrorMessages } from "@/constants/ErrorMessages";
import logger from "@/helpers/logger";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import IExamService from "@/interfaces/exam/IExamService";
import {
  ICheckRegisterGradingWithPersonRequest,
  IGradeExamWithPersonRequest,
  IGradeQuestionRequest,
  IGradeQuestionWithPersonRequest,
} from "@/interfaces/grade/IGradeDTO";
import IGradeService from "@/interfaces/grade/IGradeService";
import axios from "axios";
import { htmlToText } from "html-to-text";
import { StatusCodes } from "http-status-codes";
import { v4 as uuid } from "uuid";
import DatabaseService from "../database/DatabaseService";
import EXAM_SKILLS from "@/constants/ExamSkills";

export default class GradeService implements IGradeService {
  private readonly _context: DatabaseService;
  private readonly _examService: IExamService;
  constructor(DatabaseService: DatabaseService, ExamService: IExamService) {
    this._context = DatabaseService;
    this._examService = ExamService;
  }

  private createWritingEvaluationPrompt(
    essay: string,
    topic: string,
    level = "B1"
  ): string {
    return `
    Bạn là giám khảo chấm thi viết tiếng Anh trình độ ${level}. Hãy đánh giá bài viết sau theo các tiêu chí:
    
    Đề bài: ${topic}
    Bài viết: ${essay}
    
    Hãy chấm điểm theo thang 10 và cung cấp nhận xét thật chi tiết về:
    1. Ngữ pháp
    2. Từ vựng
    3. Tính mạch lạc và liên kết
    4. Hoàn thành yêu cầu đề bài
    5. Độ phức tạp câu
    
    Yêu cầu: 
    - Đưa ra các ví dụ cụ thể về lỗi (nếu có) và gợi ý cải thiện.
    - Kết quả trả về dạng JSON với cấu trúc dưới đây.
    - Nếu không tìm thấy đề bài hoặc bài viết, vẫn trả về theo cấu trúc này, cho điểm và nhận xét.
    - Chỉ trả về JSON theo cấu trúc bên dưới, không có nội dung khác kèm theo (Đặc biệt quan trọng)
    {
      "score": "tổng điểm",
      "overall_feedback": ["nhận xét tổng quát 1", "nhận xét tổng quát 2", ...],
      "corrected_essay": ["phiên bản đã sửa của bài viết, mỗi câu là một phần tử trong mảng"],
      "feedbackDetail": [
        {
          "title": "grammar",
          "score": "điểm",
          "feedback": ["nhận xét 1", "nhận xét 2", ...]
        },
        {
          "title": "vocabulary",
          "score": "điểm",
          "feedback": ["nhận xét 1", "nhận xét 2", ...]
        },
        {
          "title": "coherence",
          "score": "điểm",
          "feedback": ["nhận xét 1", "nhận xét 2", ...]
        },
        {
          "title": "task_achievement",
          "score": "điểm",
          "feedback": ["nhận xét 1", "nhận xét 2", ...]
        },
        {
          "title": "sentence_complexity",
          "score": "điểm",
          "feedback": ["nhận xét 1", "nhận xét 2", ...]
        }
      ]
    }
`;
  }

  private sanitizeHtmlContent(html: string) {
    return htmlToText(html, {
      wordwrap: false,
      ignoreHref: true,
      ignoreImage: true,
      preserveNewlines: false,
      uppercaseHeadings: false,
    });
  }

  private async getQuestionResult(
    examId: string,
    levelId: string
  ): Promise<IResponseBase> {
    try {
      if (!examId || !levelId) {
        return {
          data: null,
          message: "Missing examId or levelId",
          success: false,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const result = await this._context.ExamQuestionRepo.createQueryBuilder(
        "exam_question"
      )
        .leftJoinAndSelect("exam_question.exam", "exam")
        // .leftJoinAndSelect("exam_question.level", "level")
        .leftJoinAndSelect("exam_question.question", "question")
        .leftJoinAndSelect(
          "exam_question.examResultWritings",
          "examResultWritings"
        )
        .where("exam_question.examId = :examId", { examId })
        .andWhere("exam_question.levelId = :levelId", { levelId })
        .getOne();
      if (!result) {
        return {
          data: null,
          message: "No result found",
          success: false,
          error: null,
          status: StatusCodes.NOT_FOUND,
        };
      }
      return {
        data: result,
        message: "Get question result successfully",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in GradeService - method getQuestionResult() at ${new Date().getTime()} with message ${
          error?.message
        }`
      );
      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  private async checkIsGraded(
    examId: string,
    skill: "writing" | "speaking",
    type: "AI" | "PERSON"
  ): Promise<IResponseBase> {
    try {
      if (!examId) {
        return {
          data: null,
          message: "Missing examId",
          success: false,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const exam = await this._context.ExamRepo.findOne({
        where: { id: examId },
      });
      if (!exam) {
        return {
          data: null,
          message: "No exam found",
          success: false,
          error: null,
          status: StatusCodes.NOT_FOUND,
        };
      }
      if (
        skill === EXAM_SKILLS.WRITING &&
        type === "AI" &&
        exam.isGradedWritingWithAI
      ) {
        return {
          data: {
            isGraded: true,
          },
          message: "Exam has been graded with AI",
          success: true,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      if (
        skill === EXAM_SKILLS.WRITING &&
        type === "PERSON" &&
        exam.isGradedWritingWithPerson
      ) {
        return {
          data: {
            isGraded: true,
          },
          message: "Exam has been graded with Person",
          success: true,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      if (
        skill === EXAM_SKILLS.SPEAKING &&
        type === "AI" &&
        exam.isGradedSpeakingWithAI
      ) {
        return {
          data: {
            isGraded: true,
          },
          message: "Exam has been graded with AI",
          success: true,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      if (
        skill === EXAM_SKILLS.SPEAKING &&
        type === "PERSON" &&
        exam.isGradedSpeakingWithPerson
      ) {
        return {
          data: {
            isGraded: true,
          },
          message: "Exam has been graded with Person",
          success: true,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      return {
        data: {
          isGraded: false,
        },
        message: "Exam has not been graded",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in GradeService - method checkIsGraded() at ${new Date().getTime()} with message ${
          error?.message
        }`
      );
      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async gradeWritingWithAI(
    gradeData: IGradeQuestionRequest
  ): Promise<IResponseBase> {
    try {
      const { examId } = gradeData;
      if (!examId) {
        return {
          data: null,
          message: "Missing examId",
          success: false,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }

      // Check if the exam has been graded
      const checkIsGraded = await this.checkIsGraded(
        examId,
        EXAM_SKILLS.WRITING as "writing" | "speaking",
        "AI"
      );
      if (checkIsGraded.success && checkIsGraded.data.isGraded) {
        return {
          data: {
            examId,
            isGraded: true,
          },
          message: "Exam has been graded",
          success: true,
          error: null,
          status: StatusCodes.OK,
        };
      }

      const writingResult = await this._examService.getResultOfExam(
        examId,
        EXAM_SKILLS.WRITING
      );
      if (!writingResult.success) {
        return writingResult;
      }
      const questions = writingResult.data?.questions;

      if (!questions || questions.length === 0) {
        return {
          data: null,
          message: "No questions found",
          success: false,
          error: null,
          status: StatusCodes.NOT_FOUND,
        };
      }
      const API_URL = `${ENV.GEMINI_API_URL}?key=${ENV.GEMINI_API_KEY}`;
      const headers = {
        "Content-Type": "application/json",
      };
      const questionGradeData = questions.map((question) => {
        const essay = this.sanitizeHtmlContent(question.results[0].answer);
        const topic = this.sanitizeHtmlContent(
          question.question.description +
            question.question.questionContent +
            question.question.questionNote
        );
        const prompt = this.createWritingEvaluationPrompt(essay, topic, "B1");
        return {
          questionId: question.id,
          prompt,
        };
      });

      // Simulate AI grading process
      for (const question of questionGradeData) {
        const body = {
          contents: [
            {
              parts: [
                {
                  text: question.prompt,
                },
              ],
            },
          ],
        };
        const response = await axios.post(API_URL, body, { headers });

        let answer = response.data.candidates[0].content?.parts[0]?.text;
        try {
          answer = answer.replace("```json", "").replace("```", "");
          console.log("answer =================================", answer);
          const parsedAnswer = answer ? JSON.parse(answer) : { raw: answer };
          console.log(
            "parsed answer ========================================",
            parsedAnswer
          );
          // insert to GradeFeedback
          const insertToGradeFeedback = {
            id: uuid(),
            examQuestionId: question.questionId,
            score: parsedAnswer.score,
            type: "AI",
            feedback: answer,
          };
          const gradeFeedback = await this._context.GradeFeedbackRepo.save(
            insertToGradeFeedback
          );
          if (!gradeFeedback) {
            return {
              data: null,
              message: "Failed to save grading feedback",
              success: false,
              error: null,
              status: StatusCodes.INTERNAL_SERVER_ERROR,
            };
          }

          // Save the grading feedback to the database
          const exam = await this._context.ExamRepo.findOne({
            where: { id: examId },
          });
          if (!exam) {
            return {
              data: null,
              message: "No exam found",
              success: false,
              error: null,
              status: StatusCodes.NOT_FOUND,
            };
          }
          exam.isGradedWritingWithAI = true;
          await this._context.ExamRepo.save(exam);

          // update score to ExamResultWriting
          const examResultWriting =
            await this._context.ExamResultWritingRepo.findOne({
              where: { examQuestionId: question.questionId },
            });
          if (!examResultWriting) {
            return {
              data: null,
              message: "No exam result writing found",
              success: false,
              error: null,
              status: StatusCodes.NOT_FOUND,
            };
          }
          examResultWriting.point = parsedAnswer.score;
          await this._context.ExamResultWritingRepo.save(examResultWriting);
        } catch (e) {
          throw new Error("Error parsing AI grading response: " + e.message);
        }
      }
      return {
        data: {
          examId,
          isGraded: true,
        },
        message: "Grading completed successfully",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error?.message);
      console.error(
        `Error in GradeService - method gradeWritingWithAI() at ${new Date().getTime()} with message ${
          error?.message
        }`
      );

      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.stack,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async gradeSpeakingWithAI(
    gradeData: IGradeQuestionRequest
  ): Promise<IResponseBase> {
    try {
      // Simulate AI grading process
      //   const result = await this._context.GradeRepo.gradeSpeaking(id);
      //   return {
      //     data: result,
      //     message: "Grading completed successfully",
      //     success: true,
      //     error: null,
      //     status: StatusCodes.OK,
      //   };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in GradeService - method gradeSpeakingWithAI() at ${new Date().getTime()} with message ${
          error?.message
        }`
      );
      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getGradingFeedbackWithAI(
    examId: string,
    skillId: string
  ): Promise<IResponseBase> {
    try {
      if (!examId || !skillId) {
        return {
          data: null,
          message: "Missing examId or skillId",
          success: false,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }

      // check if the exam has been graded
      const checkIsGraded = await this.checkIsGraded(
        examId,
        skillId as "writing" | "speaking",
        "AI"
      );
      if (checkIsGraded.success && !checkIsGraded.data.isGraded) {
        if (skillId === EXAM_SKILLS.WRITING) {
          await this.gradeWritingWithAI({ examId, levelId: "" });
        }
      }
      // get the question result
      const examResultWriting = await this._examService.getResultOfExam(
        examId,
        skillId
      );
      if (!examResultWriting.success) {
        return examResultWriting;
      }
      const questions = examResultWriting.data?.questions;
      if (!questions || questions.length === 0) {
        return {
          data: null,
          message: "No questions found",
          success: false,
          error: null,
          status: StatusCodes.NOT_FOUND,
        };
      }
      // get the feedback from the database
      for (const question of questions) {
        const feedback = await this._context.GradeFeedbackRepo.findOne({
          where: {
            examQuestionId: question.id,
            type: "AI",
          },
        });
        if (feedback) {
          question.gradeFeedback = feedback;
        }
      }

      return {
        data: questions,
        message: "Get grading feedback successfully",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in GradeService - method getGradingFeedbackWithAI() at ${new Date().getTime()} with message ${
          error?.message
        }`
      );
      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async checkRegisterGradingExamWithPerson(
    data: ICheckRegisterGradingWithPersonRequest
  ): Promise<IResponseBase> {
    try {
      const checkIsRegistered =
        await this._context.RegisterGradeExamRepo.findOne({
          where: {
            examId: data.examId,
            skillId: data.skillId,
            contestantId: data.contestantId,
          },
        });
      return {
        data: {
          isRegistered: !!checkIsRegistered,
          registerGradeExamId: checkIsRegistered?.id,
        },
        message: "Exam has not been registered",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in GradeService - method checkRegisterGradingExamWithPerson() at ${new Date().getTime()} with message ${
          error?.message
        }`
      );
      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async registerGradingExamWithPerson(
    data: IGradeExamWithPersonRequest
  ): Promise<IResponseBase> {
    try {
      if (
        !data.examId ||
        !data.skillId ||
        !data.examinerId ||
        !data.contestantId
      ) {
        return {
          data: null,
          message: `Missing ${
            !data.examId
              ? "examId"
              : !data.skillId
              ? "skillId"
              : !data.examinerId
              ? "examinerId"
              : "contestantId"
          }`,
          success: false,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const exam = await this._context.ExamRepo.findOne({
        where: { id: data.examId },
      });
      if (!exam) {
        return {
          data: null,
          message: "No exam found",
          success: false,
          error: null,
          status: StatusCodes.NOT_FOUND,
        };
      }

      const checkIsRegistered =
        await this._context.RegisterGradeExamRepo.findOne({
          where: {
            examId: data.examId,
            skillId: data.skillId,
            examinerId: data.examinerId,
            contestantId: data.contestantId,
          },
        });
      if (checkIsRegistered) {
        return {
          data: checkIsRegistered,
          message: "Exam has been registered grading",
          success: true,
          error: null,
          status: StatusCodes.OK,
        };
      }

      const checkIsGraded = await this.checkIsGraded(
        data.examId,
        data.skillId as "writing" | "speaking",
        "PERSON"
      );
      if (checkIsGraded.success && checkIsGraded.data.isGraded) {
        return {
          data: null,
          message: "Exam has been graded",
          success: false,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const registerGradeExam = this._context.RegisterGradeExamRepo.create({
        id: uuid(),
        examId: data.examId,
        skillId: data.skillId,
        examinerId: data.examinerId,
        contestantId: data.contestantId,
        status: "REGISTERED",
      });
      const savedRegisterGradeExam =
        await this._context.RegisterGradeExamRepo.save(registerGradeExam);
      if (!savedRegisterGradeExam) {
        return {
          data: null,
          message: "Failed to save grading exam",
          success: false,
          error: null,
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
      return {
        data: savedRegisterGradeExam,
        message: "Register grading exam successfully",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in GradeService - method registerGradingExamWithPerson() at ${new Date().getTime()} with message ${
          error?.message
        }`
      );
      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getGradingFeedbackWithPerson(
    registerGradeExamId: string
  ): Promise<IResponseBase> {
    try {
      if (!registerGradeExamId) {
        return {
          data: null,
          message: "Missing registerGradeExamId",
          success: false,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const registerGradeExam =
        await this._context.RegisterGradeExamRepo.createQueryBuilder(
          "registerGradeExam"
        )
          .leftJoinAndSelect("registerGradeExam.exam", "exam")
          .leftJoinAndSelect("registerGradeExam.contestant", "contestant")
          .leftJoinAndSelect("registerGradeExam.examiner", "examiner")
          .leftJoinAndSelect(
            "examiner.examinerIntroduction",
            "examinerIntroduction"
          )
          .where("registerGradeExam.id = :registerGradeExamId", {
            registerGradeExamId,
          })
          .select([
            "registerGradeExam.id",
            "registerGradeExam.examId",
            "registerGradeExam.skillId",
            "registerGradeExam.examinerId",
            "registerGradeExam.contestantId",
            "registerGradeExam.status",
            "exam.id",
            "exam.examCode",
            "exam.isGradedWritingWithPerson",
            "exam.isGradedSpeakingWithPerson",
            "contestant.username",
            "contestant.fullName",
            "contestant.avatar",
            "contestant.email",
            "examiner.username",
            "examiner.fullName",
            "examiner.avatar",
            "examiner.email",
            "examiner.phoneNumber",
            "examinerIntroduction.banner",
            "examinerIntroduction.introduction",
            "examinerIntroduction.description",
            "examinerIntroduction.workPlace",
            "examinerIntroduction.workAddress",
          ])
          .getOne();
      if (!registerGradeExam) {
        return {
          data: null,
          message: "No register grading exam found",
          success: false,
          error: null,
          status: StatusCodes.NOT_FOUND,
        };
      }
      const { examId, skillId } = registerGradeExam;
      if (!examId || !skillId) {
        return {
          data: null,
          message: `Missing ${!examId ? "examId" : "skillId"}`,
          success: false,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      // get the question result
      const examResultWriting = await this._examService.getResultOfExam(
        examId,
        skillId
      );
      if (!examResultWriting.success) {
        return examResultWriting;
      }
      const questions = examResultWriting.data?.questions;
      if (!questions || questions.length === 0) {
        return {
          data: null,
          message: "No questions found",
          success: false,
          error: null,
          status: StatusCodes.NOT_FOUND,
        };
      }

      // get the feedback from the database
      for (const question of questions) {
        const feedback = await this._context.GradeFeedbackRepo.findOne({
          where: {
            examQuestionId: question.id,
            type: "PERSON",
            registerGradeExamId: registerGradeExamId,
          },
        });
        console.log("feedback", feedback);
        if (feedback) {
          question.gradeFeedback = feedback;
        } else {
          question.gradeFeedback = null;
        }
      }
      const responseData = {
        registeredGrade: registerGradeExam,
        questions: questions,
      };
      return {
        data: responseData,
        message: "Get grading feedback successfully",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in GradeService - method getGradingFeedbackWithPerson() at ${new Date().getTime()} with message ${
          error?.message
        }`
      );
      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getListRegisteredGradeExamByExaminer(
    examinerId: string
  ): Promise<IResponseBase> {
    try {
      if (!examinerId) {
        return {
          data: null,
          message: "Missing examinerId",
          success: false,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const registeredGrades =
        await this._context.RegisterGradeExamRepo.createQueryBuilder(
          "registerGradeExam"
        )
          .leftJoinAndSelect("registerGradeExam.exam", "exam")
          .leftJoinAndSelect("registerGradeExam.contestant", "contestant")
          .where("registerGradeExam.examinerId = :examinerId", { examinerId })
          .select([
            "registerGradeExam.id",
            "registerGradeExam.examId",
            "registerGradeExam.skillId",
            "registerGradeExam.examinerId",
            "registerGradeExam.contestantId",
            "registerGradeExam.status",
            "exam.id",
            "exam.examCode",
            "exam.isGradedWritingWithPerson",
            "exam.isGradedSpeakingWithPerson",
            "contestant.username",
            "contestant.fullName",
            "contestant.avatar",
            "contestant.email",
          ])
          .orderBy("registerGradeExam.status", "DESC")
          .getMany();
      return {
        data: registeredGrades,
        message: "Get list registered grading exam successfully",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in GradeService - method getListRegisteredGradeExamWithPerson() at ${new Date().getTime()} with message ${
          error?.message
        }`
      );
      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async gradeQuestionWithPerson(
    gradeData: IGradeQuestionWithPersonRequest
  ): Promise<IResponseBase> {
    try {
      const { examId } = gradeData;
      if (!examId) {
        return {
          data: null,
          message: "Missing examId",
          success: false,
          error: null,
          status: StatusCodes.BAD_REQUEST,
        };
      }

      const examQuestion = await this._context.ExamQuestionRepo.findOne({
        where: {
          examId: examId,
          levelId: gradeData.levelId,
        },
      });
      if (!examQuestion) {
        return {
          data: null,
          message: "No exam question found",
          success: false,
          error: null,
          status: StatusCodes.NOT_FOUND,
        };
      }

      const gradeFeedbackResponse =
        await this._context.GradeFeedbackRepo.findOne({
          where: {
            examQuestionId: examQuestion.id,
            type: "PERSON",
          },
        });

      // insert to GradeFeedback
      const insertToGradeFeedback = {
        id: uuid(),
        examQuestionId: examQuestion.id,
        score: gradeData.score,
        type: "PERSON",
        feedback: gradeData.feedback,
        registerGradeExamId: gradeData.registerGradeExamId,
      };

      if (gradeFeedbackResponse) {
        insertToGradeFeedback.id = gradeFeedbackResponse.id;
      }
      const upsertResult = await this._context.GradeFeedbackRepo.upsert(
        insertToGradeFeedback,
        { conflictPaths: ["id"] }
      );
      if (!upsertResult) {
        return {
          data: null,
          message: "Failed to save grading feedback",
          success: false,
          error: null,
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }

      // update status to GRADING
      const registerGradeExam =
        await this._context.RegisterGradeExamRepo.findOne({
          where: {
            id: gradeData.registerGradeExamId,
          },
        });
      if (!registerGradeExam) {
        return {
          data: null,
          message: "No register grading exam found",
          success: false,
          error: null,
          status: StatusCodes.NOT_FOUND,
        };
      }
      if (registerGradeExam.status === "REGISTERED") {
        registerGradeExam.status = "GRADING";
        await this._context.RegisterGradeExamRepo.save(registerGradeExam);
      }

      const listGradeFeedbackOfSkill =
        await this._context.GradeFeedbackRepo.createQueryBuilder(
          "gradeFeedback"
        )
          .leftJoinAndSelect(
            "gradeFeedback.registerGradeExam",
            "registerGradeExam"
          )
          .where("registerGradeExam.skillId = :skillId", {
            skillId: gradeData.skillId,
          })
          .andWhere("registerGradeExam.id = :registerGradeExamId", {
            registerGradeExamId: gradeData.registerGradeExamId,
          })
          .getMany();

      if (
        (listGradeFeedbackOfSkill.length === 3 &&
          gradeData.skillId === EXAM_SKILLS.SPEAKING) ||
        (listGradeFeedbackOfSkill.length === 2 &&
          gradeData.skillId === EXAM_SKILLS.WRITING)
      ) {
        // Save the grading feedback to the database
        const exam = await this._context.ExamRepo.findOne({
          where: { id: examId },
        });
        if (!exam) {
          return {
            data: null,
            message: "No exam found",
            success: false,
            error: null,
            status: StatusCodes.NOT_FOUND,
          };
        }
        if (gradeData.skillId === EXAM_SKILLS.WRITING) {
          exam.isGradedWritingWithPerson = true;
        } else if (gradeData.skillId === EXAM_SKILLS.SPEAKING) {
          exam.isGradedSpeakingWithPerson = true;
        }

        await this._context.ExamRepo.save(exam);
        // update score to ExamResultWriting
        if (gradeData.skillId === EXAM_SKILLS.WRITING) {
          const examResultWriting =
            await this._context.ExamResultWritingRepo.findOne({
              where: { examQuestionId: examQuestion.id },
            });

          if (!examResultWriting) {
            return {
              data: null,
              message: "No exam result writing found",
              success: false,
              error: null,
              status: StatusCodes.NOT_FOUND,
            };
          }
          examResultWriting.point = +gradeData.score;
          await this._context.ExamResultWritingRepo.save(examResultWriting);
        }
        if (gradeData.skillId === EXAM_SKILLS.SPEAKING) {
          const examResultSpeaking =
            await this._context.ExamResultSpeakingRepo.findOne({
              where: { examQuestionId: examQuestion.id },
            });

          if (!examResultSpeaking) {
            return {
              data: null,
              message: "No exam result speaking found",
              success: false,
              error: null,
              status: StatusCodes.NOT_FOUND,
            };
          }
          examResultSpeaking.point = +gradeData.score;
          await this._context.ExamResultSpeakingRepo.save(examResultSpeaking);
        }

        // update score to ExamSkillStatuses
        const examSkillStatus = await this._context.ExamSkillStatusRepo.findOne(
          {
            where: {
              examId: examId,
              skillId: gradeData.skillId,
            },
          }
        );
        if (!examSkillStatus) {
          return {
            data: null,
            message: "No exam skill status found",
            success: false,
            error: null,
            status: StatusCodes.NOT_FOUND,
          };
        }
        examSkillStatus.score = +gradeData.score;
        await this._context.ExamSkillStatusRepo.save(examSkillStatus);

        // update status to REGISTERED
        const registerGradeExam =
          await this._context.RegisterGradeExamRepo.findOne({
            where: {
              id: gradeData.registerGradeExamId,
            },
          });
        if (!registerGradeExam) {
          return {
            data: null,
            message: "No register grading exam found",
            success: false,
            error: null,
            status: StatusCodes.NOT_FOUND,
          };
        }
        registerGradeExam.status = "GRADED";
        await this._context.RegisterGradeExamRepo.save(registerGradeExam);
      }

      return {
        data: {
          examId,
          isGraded: true,
        },
        message: "Grading completed successfully",
        success: true,
        error: null,
        status: StatusCodes.OK,
      };
    } catch (error) {
      logger.error(error?.message);
      console.log(
        `Error in GradeService - method gradeQuestionWithPerson() at ${new Date().getTime()} with message ${
          error?.message
        }`
      );
      return {
        data: null,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        success: false,
        error: {
          message: error.message,
          errorDetail: error.message,
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
