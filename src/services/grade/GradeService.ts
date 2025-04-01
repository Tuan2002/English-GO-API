import { ENV } from "@/constants/env";
import { ErrorMessages } from "@/constants/ErrorMessages";
import logger from "@/helpers/logger";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import IExamService from "@/interfaces/exam/IExamService";
import { IGradeQuestionRequest } from "@/interfaces/grade/IGradeDTO";
import IGradeService from "@/interfaces/grade/IGradeService";
import axios from "axios";
import { htmlToText } from "html-to-text";
import { StatusCodes } from "http-status-codes";
import { v4 as uuid } from "uuid";
import DatabaseService from "../database/DatabaseService";

export default class GradeService implements IGradeService {
  private readonly _context: DatabaseService;
  private readonly _examService: IExamService;
  constructor(DatabaseService: DatabaseService, ExamService: IExamService) {
    this._context = DatabaseService;
    this._examService = ExamService;
  }

  private createWritingEvaluationPrompt(essay: string, topic: string, level = "B1"): string {
    return `
    Bạn là giám khảo chấm thi viết tiếng Anh trình độ ${level}. Hãy đánh giá bài viết sau theo các tiêu chí:
    
    Đề bài: ${topic}
    Bài viết: ${essay}
    
    Hãy chấm điểm theo thang 10 và cung cấp nhận xét thật chi tiết về:
    1. Ngữ pháp (2 điểm)
    2. Từ vựng (2 điểm)
    3. Tính mạch lạc và liên kết (2 điểm)
    4. Hoàn thành yêu cầu đề bài (2 điểm)
    5. Độ phức tạp câu (2 điểm)
    
    Đưa ra các ví dụ cụ thể về lỗi (nếu có) và gợi ý cải thiện.
    Kết quả trả về dạng JSON với cấu trúc dưới đây (Nếu không tìm thấy đề bài hoặc bài viết, vẫn trả về theo cấu trúc này, cho điểm và nhận xét)
    Chỉ trả về JSON, không có nội dung khác
    {
        "score": tổng điểm,
        "grammar": {
            "score": điểm,
            "feedback": [nhận xét 1, nhận xét 2, ...]
        },
        "vocabulary": {
            "score": điểm,
            "feedback": [nhận xét 1, nhận xét 2, ...]
        },
        "coherence": {
            "score": điểm,
            "feedback": [nhận xét 1, nhận xét 2, ...]
        },
        "task_achievement": {
            "score": điểm,
            "feedback": [nhận xét 1, nhận xét 2, ...]
        },
        "sentence_complexity": {
            "score": điểm,
            "feedback": [nhận xét 1, nhận xét 2, ...]
        },
        "overall_feedback": [nhận xét 1, nhận xét 2, ...],
        "corrected_essay": phiên bản đã sửa của bài viết hoặc bài viết mới nếu bài viết không đạt yêu cầu (quá ngắn hoặc không liên quan).
    }`;
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

  private async getQuestionResult(examId: string, levelId: string): Promise<IResponseBase> {
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
      const result = await this._context.ExamQuestionRepo.createQueryBuilder("exam_question")
        .leftJoinAndSelect("exam_question.exam", "exam")
        // .leftJoinAndSelect("exam_question.level", "level")
        .leftJoinAndSelect("exam_question.question", "question")
        .leftJoinAndSelect("exam_question.examResultWritings", "examResultWritings")
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
      console.log(`Error in GradeService - method getQuestionResult() at ${new Date().getTime()} with message ${error?.message}`);
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

  private async checkIsGraded(examId: string, skill: "writing" | "speaking", type: "AI" | "PERSON"): Promise<IResponseBase> {
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
      if (skill === "writing" && type === "AI" && exam.isGradedWritingWithAI) {
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
      if (skill === "writing" && type === "PERSON" && exam.isGradedWritingWithPerson) {
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
      if (skill === "speaking" && type === "AI" && exam.isGradedSpeakingWithAI) {
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
      if (skill === "speaking" && type === "PERSON" && exam.isGradedSpeakingWithPerson) {
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
      console.log(`Error in GradeService - method checkIsGraded() at ${new Date().getTime()} with message ${error?.message}`);
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

  async gradeWritingWithAI(gradeData: IGradeQuestionRequest): Promise<IResponseBase> {
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
      const checkIsGraded = await this.checkIsGraded(examId, "writing", "AI");
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

      const writingResult = await this._examService.getResultOfExam(examId, "writing");
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
          question.question.description + question.question.questionContent + question.question.questionNote
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
          console.log("parsed answer ========================================", parsedAnswer);
          // insert to GradeFeedback
          const insertToGradeFeedback = {
            id: uuid(),
            examQuestionId: question.questionId,
            score: parsedAnswer.score,
            type: "AI",
            feedback: answer,
          };
          const gradeFeedback = await this._context.GradeFeedbackRepo.save(insertToGradeFeedback);
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
          const examResultWriting = await this._context.ExamResultWritingRepo.findOne({
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
        `Error in GradeService - method gradeWritingWithAI() at ${new Date().getTime()} with message ${error?.message}`
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
  async gradeSpeakingWithAI(gradeData: IGradeQuestionRequest): Promise<IResponseBase> {
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
        `Error in GradeService - method gradeSpeakingWithAI() at ${new Date().getTime()} with message ${error?.message}`
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

  async getGradingFeedbackWithAI(examId: string, skillId: string): Promise<IResponseBase> {
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
      const checkIsGraded = await this.checkIsGraded(examId, skillId as "writing" | "speaking", "AI");
      if (checkIsGraded.success && !checkIsGraded.data.isGraded) {
        if (skillId === "writing") {
          await this.gradeWritingWithAI({ examId, levelId: "" });
        }
      }
      // get the question result
      const examResultWriting = await this._examService.getResultOfExam(examId, skillId);
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
        `Error in GradeService - method getGradingFeedbackWithAI() at ${new Date().getTime()} with message ${error?.message}`
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
