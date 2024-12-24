import { ErrorMessages } from "@/constants/ErrorMessages";
import { LocalStorage } from "@/constants/LocalStorage";
import { Exam } from "@/entity/Exam";
import { ExamQuestion } from "@/entity/ExamQuestion";
import { ExamResultListening } from "@/entity/ExamResultListening";
import { ExamResultReading } from "@/entity/ExamResultReading";
import { ExamResultSpeaking } from "@/entity/ExamResultSpeaking";
import { ExamResultWriting } from "@/entity/ExamResultWriting";
import { ExamSkillStatus } from "@/entity/ExamSkillStatus";
import logger from "@/helpers/logger";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import { EExamSkillStatus, ISubmitSkillRequest } from "@/interfaces/exam/IExamDTO";
import IExamService from "@/interfaces/exam/IExamService";
import ILevelService from "@/interfaces/level/ILevelService";
import { ISpeakingQuestionSubmit } from "@/interfaces/question/QuestionDTO";
import { RequestStorage } from "@/middlewares";
import { StatusCodes } from "http-status-codes";
import { In } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import DatabaseService from "../database/DatabaseService";

export default class ExamServices implements IExamService {
  private readonly _levelService: ILevelService;
  private readonly _context: DatabaseService;
  constructor(LevelService: ILevelService, DatabaseService: DatabaseService) {
    this._levelService = LevelService;
    this._context = DatabaseService;
  }
  async getCurrentExam(userId: string): Promise<IResponseBase> {
    try {
      const lastExam = await this._context.ExamRepo.createQueryBuilder("exam")
        .where("exam.userId = :userId", { userId })
        .andWhere("exam.isDeleted = :isDeleted", { isDeleted: false })
        .orderBy("exam.createdAt", "DESC")
        .getOne();
      const examSkillStatuses = await this._context.ExamSkillStatusRepo.createQueryBuilder("examSkillStatus")
        .innerJoinAndSelect("examSkillStatus.skill", "skill")
        .where("examSkillStatus.examId = :examId", { examId: lastExam.id })
        .orderBy("examSkillStatus.order", "ASC")
        .select([
          "examSkillStatus.id",
          "examSkillStatus.examId",
          "examSkillStatus.skillId",
          "examSkillStatus.startTime",
          "examSkillStatus.endTime",
          "examSkillStatus.status",
          "examSkillStatus.order",
          "skill.name",
          "skill.expiredTime",
        ])
        .getMany();
      if (!examSkillStatuses || examSkillStatuses.length === 0) {
        return {
          data: null,
          message: "No exam skill status found, please try again later",
          success: false,
          error: {
            message: "No exam skill status found, please try again later",
            errorDetail: "No exam skill status found",
          },
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
      let currentSkill = examSkillStatuses[0].skillId;
      let isDone = true;
      for (let i = 0; i < examSkillStatuses.length; i++) {
        const expiredTimeOfThisExamSkill = new Date(
          parseInt(examSkillStatuses[i].startTime) + examSkillStatuses[i].skill.expiredTime * 60 * 1000
        ).getTime();
        if (examSkillStatuses[i].status === EExamSkillStatus.IN_PROGRESS && expiredTimeOfThisExamSkill > new Date().getTime()) {
          currentSkill = examSkillStatuses[i].skillId;
          isDone = false;
          break;
        }
        if (examSkillStatuses[i].status === EExamSkillStatus.NOT_STARTED) {
          currentSkill = examSkillStatuses[i].skillId;
          isDone = false;
          break;
        }
      }

      if (
        // if there is no exam yet, create a new one
        !lastExam ||
        // if the last exam is not done yet or the end time is over
        isDone ||
        // if the last exam is not done yet or the end time is over
        (lastExam && lastExam.isDone) ||
        // if the last exam is done but the end time is over
        (lastExam && new Date(parseInt(lastExam.endTime)) < new Date())
      ) {
        return {
          data: null,
          message: "Your exam is expired, please start a new exam!",
          success: false,
          error: {
            message: "Your exam is expired, please start a new exam!",
            errorDetail: "Your exam is expired, please start a new exam!",
          },
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
      return {
        data: {
          exam: lastExam,
          currentSkill: examSkillStatuses.find((examSkillStatus) => examSkillStatus.skillId === currentSkill),
        },
        message: "Continue with the last exam",
        success: true,
        status: StatusCodes.OK,
        error: null,
      };
    } catch (error) {
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

  async startNewExam(userId: string): Promise<IResponseBase> {
    const queryRunner = this._context.createQueryRunner();
    try {
      const levels = await this._levelService.getAllLevels();
      if (!levels || !levels.success) {
        return levels;
      }
      const groupedQuestions = await this._context.QuestionRepo.createQueryBuilder("question")
        .where("question.isActive = :isActive", { isActive: true })
        .andWhere("question.isDeleted = :isDeleted", { isDeleted: false })
        .groupBy("question.levelId")
        .select(["question.levelId as levelId", "JSON_AGG(question.id) as questionIds"])
        .getRawMany();

      if (!groupedQuestions || groupedQuestions.length === 0) {
        return {
          data: null,
          message: "No question found, please try again later",
          success: false,
          error: {
            message: "No question found, please try again later",
            errorDetail: "No question found",
          },
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
      const questionAfterRandom = groupedQuestions.map((groupedQuestion) => {
        const questionLength = groupedQuestion.questionids.length;
        const questionId = groupedQuestion.questionids[Math.floor(Math.random() * questionLength)];
        return {
          levelId: groupedQuestion.levelid,
          questionId,
        };
      });
      await queryRunner.connect();
      await queryRunner.startTransaction();
      // Mặc định sẽ đóng đề sau 200' từ lúc tạo
      // thêm đề mới vào bảng exam
      const newExam = new Exam();
      newExam.userId = userId;
      newExam.id = uuidv4();
      newExam.examCode = "EXAMPRO";
      newExam.startTime = new Date().getTime().toString();
      newExam.endTime = (new Date().getTime() + 200 * 60 * 1000).toString();
      const examCreated = await queryRunner.manager.save(Exam, newExam);

      // Thêm các kĩ năng vào bảng examSkillStatuses
      // const skills = ["listening", "reading", "writing", "speaking"];
      const listSkills = [
        { name: "listening", totalQuestion: 35 },
        { name: "reading", totalQuestion: 40 },
        { name: "writing", totalQuestion: 2 },
        { name: "speaking", totalQuestion: 3 },
      ];

      const skillStatuses = Array<ExamSkillStatus>();
      listSkills.forEach((skill, index) => {
        const examSkillStatus = new ExamSkillStatus();
        examSkillStatus.examId = examCreated.id;
        examSkillStatus.id = uuidv4();
        examSkillStatus.startTime = new Date().getTime().toString();
        examSkillStatus.endTime = (new Date().getTime() + 50 * 60 * 1000).toString();
        examSkillStatus.skillId = skill.name;
        examSkillStatus.score = 0;
        examSkillStatus.order = index;
        examSkillStatus.totalQuestion = skill.totalQuestion;
        examSkillStatus.status = EExamSkillStatus.NOT_STARTED; // "PENDING" | "COMPLETED" | "MAKING"
        skillStatuses.push(examSkillStatus);
      });
      await queryRunner.manager.insert(ExamSkillStatus, skillStatuses);
      // Thêm câu hỏi vào bảng exam_question
      const examQuestions = Array<ExamQuestion>();
      questionAfterRandom.forEach((question) => {
        const examQuestion = new ExamQuestion();
        examQuestion.examId = examCreated.id;
        examQuestion.id = uuidv4();
        examQuestion.questionId = question.questionId;
        examQuestion.levelId = question.levelId;
        examQuestions.push(examQuestion);
      });
      await queryRunner.manager.insert(ExamQuestion, examQuestions);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return {
        data: examCreated,
        message: "Start with a new exam",
        success: true,
        status: StatusCodes.OK,
        error: null,
      };
      // levelId
    } catch (error) {
      console.log("Transaction failed at startNewExam", error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
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

  async participateExam(userId: string): Promise<IResponseBase> {

    try {
      const exam = await this.getCurrentExam(userId);
      if (!exam || !exam.success || !exam.data) {
        // if there is no exam yet, create a new one
        const newExam = await this.startNewExam(userId);
        return newExam;
      } else {
        // if there is an exam, continue with the last exam
        return exam;
      }
    } catch (error) {
      console.log("An error occurred at participateExam", error);
      logger.error("Error at participateExam", error);
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

  async continueExam(userId: string): Promise<IResponseBase> {
    try {
      const exam = await this.getCurrentExam(userId);
      if (!exam || !exam.success || !exam.data) {
        return exam;
      }
      const currentExam = exam.data.exam;
      const examSkillStatuses = await this._context.ExamSkillStatusRepo.createQueryBuilder("examSkillStatus")
        .innerJoinAndSelect("examSkillStatus.skill", "skill")
        .where("examSkillStatus.examId = :examId", { examId: currentExam.id })
        .orderBy("examSkillStatus.order", "ASC")
        .select([
          "examSkillStatus.id",
          "examSkillStatus.examId",
          "examSkillStatus.skillId",
          "examSkillStatus.startTime",
          "examSkillStatus.endTime",
          "examSkillStatus.status",
          "examSkillStatus.order",
          "skill.name",
          "skill.expiredTime",
        ])
        .getMany();
      if (!examSkillStatuses || examSkillStatuses.length === 0) {
        return {
          data: null,
          message: "No exam skill status found, please try again later",
          success: false,
          error: {
            message: "No exam skill status found, please try again later",
            errorDetail: "No exam skill status found",
          },
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
      let currentSkill = examSkillStatuses[0].skillId;
      let isDone = true;
      for (let i = 0; i < examSkillStatuses.length; i++) {
        const expiredTimeOfThisExamSkill = new Date(
          parseInt(examSkillStatuses[i].startTime) + examSkillStatuses[i].skill.expiredTime * 60 * 1000
        ).getTime();
        if (examSkillStatuses[i].status === EExamSkillStatus.IN_PROGRESS && expiredTimeOfThisExamSkill > new Date().getTime()) {
          currentSkill = examSkillStatuses[i].skillId;
          isDone = false;
          break;
        }
        if (examSkillStatuses[i].status === EExamSkillStatus.NOT_STARTED) {
          currentSkill = examSkillStatuses[i].skillId;
          isDone = false;
          break;
        }
      }
      if (isDone) {
        return {
          data: null,
          message: "Your exam is expired, please start a new exam!",
          success: false,
          error: {
            message: "Your exam is expired, please start a new exam!",
            errorDetail: "Your exam is expired, please start a new exam!",
          },
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }

      const currentSkillData = examSkillStatuses.find((examSkillStatus) => examSkillStatus.skillId === currentSkill);
      if (currentSkillData && currentSkillData.status === EExamSkillStatus.NOT_STARTED) {
        currentSkillData.status = EExamSkillStatus.IN_PROGRESS;
        currentSkillData.startTime = new Date().getTime().toString();
        currentSkillData.endTime = (new Date().getTime() + currentSkillData.skill.expiredTime * 60 * 1000).toString();
        await this._context.ExamSkillStatusRepo.save(currentSkillData);
      }

      const listQuestionOfCurrentExamSkill = await this._context.ExamQuestionRepo.createQueryBuilder("examQuestion")
        .innerJoinAndSelect("examQuestion.question", "questions")
        .innerJoinAndSelect("questions.skill", "skill")
        .innerJoinAndSelect("questions.level", "level")
        .leftJoinAndSelect("questions.subQuestions", "subQuestions")
        .leftJoinAndSelect("subQuestions.answers", "answers")
        .where("examQuestion.examId = :examId", { examId: currentExam.id })
        .andWhere("questions.skillId = :skillId", { skillId: currentSkill })
        .select([
          "examQuestion.id",
          "examQuestion.examId",
          "examQuestion.questionId",
          "questions.id",
          "questions.levelId",
          "questions.questionContent",
          "questions.questionNote",
          "questions.description",
          "questions.attachedFile",
          "skill.id",
          "skill.name",
          "skill.displayName",
          "level.id",
          "level.displayName",
          "level.description",
          "level.subQuestionNumber",
          "level.description",
          "subQuestions.id",
          "subQuestions.content",
          "subQuestions.order",
          "answers.id",
          "answers.answerContent",
          "answers.order",
        ])
        .orderBy("questions.levelId", "ASC")
        .addOrderBy("subQuestions.order", "ASC")
        .addOrderBy("answers.order", "ASC")
        .getMany();

      return {
        data: {
          exam: currentExam,
          skill: currentSkillData,
          questions: listQuestionOfCurrentExamSkill,
        },
        message: "Continue with the last exam",
        success: true,
        status: StatusCodes.OK,
        error: null,
      };
    } catch (error) {
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

  async submitSkill(userId: string, data: ISubmitSkillRequest): Promise<IResponseBase> {
    const currentExamData = await this.getCurrentExam(userId);
    if (!currentExamData || !currentExamData.success || !currentExamData.data) {
      return currentExamData;
    }
    const skillId = data.skillId;
    if (!skillId) {
      return {
        data: null,
        message: "SkillId is required",
        success: false,
        error: {
          message: "SkillId is required",
          errorDetail: "SkillId is required",
        },
        status: StatusCodes.BAD_REQUEST,
      };
    }
    const skillData = await this._context.SkillRepo.createQueryBuilder("skill")
      .innerJoinAndSelect("skill.levels", "levels")
      .where("skill.id = :skillId", { skillId })
      .getOne();
    if (!skillData) {
      return {
        data: null,
        message: "Skill not found",
        success: false,
        error: {
          message: "Skill not found",
          errorDetail: "Skill not found",
        },
        status: StatusCodes.NOT_FOUND,
      };
    }
    const questions = data.questions;
    if (skillData.levels.length !== questions.length) {
      return {
        data: null,
        message: "The number of questions is not enough",
        success: false,
        error: {
          message: "The number of questions is not enough",
          errorDetail: "The number of questions is not enough",
        },
        status: StatusCodes.BAD_REQUEST,
      };
    }
    const queryRunner = this._context.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      if (skillId === "listening") {
        let score = 0;
        const examResultListenings = Array<ExamResultListening>();

        // Duyệt tất cả các câu hỏi song song
        const examQuestions = await this._context.ExamQuestionRepo.find({
          where: {
            examId: currentExamData.data.exam.id,
            levelId: In(questions.map((question) => question.levelId)),
          },
        });
        questions.forEach((question) => {
          const examQuestion = examQuestions.find((examQuestion) => examQuestion.levelId === question.levelId);
          if (!examQuestion) {
            return;
          }
          // Duyệt tất cả các sub-questions song song
          question.subQuestions.forEach((subquestion) => {
            if (subquestion.selectedAnswerId) {
              const subQuestionScore = question.subQuestions.find((sub) => sub.id === subquestion.id);
              if (subquestion.selectedAnswerId === subQuestionScore.correctAnswer) {
                score += 1;
              }
              const examResultListening = new ExamResultListening();
              examResultListening.id = uuidv4();
              examResultListening.examQuestionId = examQuestion.id;
              examResultListening.subQuestionId = subquestion.id;
              examResultListening.answerId = subquestion.selectedAnswerId;
              examResultListenings.push(examResultListening);
            }
          });
        })
        await queryRunner.manager.insert(ExamResultListening, examResultListenings)
        // Cập nhật trạng thái và điểm cho kỹ năng
        const examSkillStatus = await this._context.ExamSkillStatusRepo.findOne({
          where: {
            examId: currentExamData.data.exam.id,
            skillId,
          },
        });

        examSkillStatus.status = EExamSkillStatus.FINISHED;
        examSkillStatus.score = score;
        await queryRunner.manager.update(ExamSkillStatus, { id: examSkillStatus.id }, examSkillStatus);
      }
      if (skillId === "reading") {
        let score = 0;
        const examResultReadings = Array<ExamResultReading>();
        // Duyệt tất cả các câu hỏi song song
        const examQuestions = await this._context.ExamQuestionRepo.find({
          where: {
            examId: currentExamData.data.exam.id,
            levelId: In(questions.map((question) => question.levelId)),
          },
        });

        questions.forEach((question) => {
          const examQuestion = examQuestions.find((examQuestion) => examQuestion.levelId === question.levelId);
          if (!examQuestion) {
            return;
          }
          // Duyệt tất cả các sub-questions song song
          question.subQuestions.forEach((subquestion) => {
            if (subquestion.selectedAnswerId) {
              const subQuestionScore = question.subQuestions.find((sub) => sub.id === subquestion.id);
              if (subquestion.selectedAnswerId === subQuestionScore.correctAnswer) {
                console.log("subquestion.selectedAnswerId", subquestion.selectedAnswerId);
                score += 1;
              }
              const examResultReading = new ExamResultReading();
              examResultReading.id = uuidv4();
              examResultReading.examQuestionId = examQuestion.id;
              examResultReading.subQuestionId = subquestion.id;
              examResultReading.answerId = subquestion.selectedAnswerId;
              examResultReadings.push(examResultReading);
            }
          });
        })
        await queryRunner.manager.insert(ExamResultReading, examResultReadings)

        // Sau khi tất cả các câu hỏi và sub-questions đã được xử lý
        const examSkillStatus = await this._context.ExamSkillStatusRepo.findOne({
          where: {
            examId: currentExamData.data.exam.id,
            skillId,
          },
        });
        examSkillStatus.status = EExamSkillStatus.FINISHED;
        examSkillStatus.score = score;
        console.log("examSkillStatus: =>>>>>>>>>>>>>>", examSkillStatus);
        console.log("Score: =>>>>>>>>>>>>>", score);
        await queryRunner.manager.update(ExamSkillStatus, { id: examSkillStatus.id }, examSkillStatus);
      }

      if (skillId === "writing") {
        const examResultWritings = Array<ExamResultWriting>();
        const examQuestions = await this._context.ExamQuestionRepo.find({
          where: {
            examId: currentExamData.data.exam.id,
            levelId: In(questions.map((question) => question.levelId)),
          },
        });
        questions.forEach(async (question) => {
          const examQuestion = examQuestions.find((examQuestion) => examQuestion.levelId === question.levelId);
          if (!examQuestion) {
            return;
          }
          const examResultWriting = new ExamResultWriting();
          examResultWriting.id = uuidv4();
          examResultWriting.examQuestionId = examQuestion.id;
          examResultWriting.data = question.questionData;
          examResultWritings.push(examResultWriting);
        });
        await queryRunner.manager.insert(ExamResultWriting, examResultWritings);
        const examSkillStatus = await this._context.ExamSkillStatusRepo.findOne({
          where: {
            examId: currentExamData.data.exam.id,
            skillId,
          },
        });
        examSkillStatus.status = EExamSkillStatus.FINISHED;
        await queryRunner.manager.update(ExamSkillStatus, { id: examSkillStatus.id }, examSkillStatus);
      }
      if (skillId === "speaking") {

        const examResultSpeakings = Array<ExamResultSpeaking>();
        const examQuestions = await this._context.ExamQuestionRepo.find({
          where: {
            examId: currentExamData.data.exam.id,
            levelId: In(questions.map((question) => question.levelId)),
          },
        });
        questions.forEach(async (question) => {
          const examQuestion = examQuestions.find((examQuestion) => examQuestion.levelId === question.levelId);
          if (!examQuestion) {
            return;
          }
          const examResultSpeaking = new ExamResultSpeaking();
          examResultSpeaking.id = uuidv4();
          examResultSpeaking.examQuestionId = examQuestion.id;
          examResultSpeaking.data = question.questionData;
          examResultSpeakings.push(examResultSpeaking);
        });
        await queryRunner.manager.insert(ExamResultSpeaking, examResultSpeakings);
        const examSkillStatus = await this._context.ExamSkillStatusRepo.findOne({
          where: {
            examId: currentExamData.data.exam.id,
            skillId,
          },
        });
        examSkillStatus.status = EExamSkillStatus.FINISHED;
        await queryRunner.manager.update(ExamSkillStatus, { id: examSkillStatus.id }, examSkillStatus);
      }
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return {
        data: null,
        message: "Submit successfully",
        success: true,
        status: StatusCodes.OK,
        error: null,
      };
    } catch (error) {
      console.log("error", error);
      await queryRunner.rollbackTransaction();
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
  async submitSpeakingSkill(userId: string, data: ISpeakingQuestionSubmit): Promise<IResponseBase> {
    try {
      const currentExamData = await this.getCurrentExam(userId);
      if (!currentExamData || !currentExamData.success || !currentExamData.data) {
        return currentExamData;
      }
      const skillId = "speaking";
      const exam = currentExamData.data.exam;

      const examQuestion = await this._context.ExamQuestionRepo.findOne({
        where: {
          examId: exam.id,
          levelId: data.levelId,
        },
      });
      if (!examQuestion) {
        return {
          data: null,
          message: "No exam question found",
          success: false,
          error: {
            message: "No exam question found",
            errorDetail: "No exam question found",
          },
          status: StatusCodes.NOT_FOUND,
        };
      }

      const checkIsSubmitted = await this._context.ExamResultSpeakingRepo.findOne({
        where: {
          examQuestionId: examQuestion.id,
        },
      });
      if (checkIsSubmitted) {
        return {
          data: null,
          message: "This question has been submitted",
          success: false,
          error: {
            message: "This question has been submitted",
            errorDetail: "This question has been submitted",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }

      const examResultSpeaking = new ExamResultSpeaking();
      examResultSpeaking.id = uuidv4();
      examResultSpeaking.examQuestionId = examQuestion.id;
      examResultSpeaking.data = data.answer;
      examResultSpeaking.feedback = "";
      const submited = await this._context.ExamResultSpeakingRepo.save(examResultSpeaking);

      const checkIsDone = await this._context.ExamResultSpeakingRepo.createQueryBuilder("examResultSpeaking")
        .innerJoinAndSelect("examResultSpeaking.examQuestion", "examQuestion")
        .where("examQuestion.examId = :examId", { examId: exam.id })
        .getMany();
      if (checkIsDone.length === 3) {
        const examSkillStatus = await this._context.ExamSkillStatusRepo.findOne({
          where: {
            examId: exam.id,
            skillId,
          },
        });
        examSkillStatus.status = EExamSkillStatus.FINISHED;
        await this._context.ExamSkillStatusRepo.save(examSkillStatus);
      }

      return {
        data: submited,
        message: "Submit successfully",
        success: true,
        status: StatusCodes.OK,
        error: null,
      };
    } catch (error) {
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

  async getCurrentSpeakingQuestion(userId: string): Promise<IResponseBase> {
    try {
      const exam = await this.getCurrentExam(userId);
      if (!exam || !exam.success || !exam.data) {
        return exam;
      }
      const currentExam = exam.data.exam;
      const checkIsDone = await this._context.ExamSkillStatusRepo.findOne({
        where: {
          examId: currentExam.id,
          skillId: "speaking",
          status: EExamSkillStatus.FINISHED,
        },
      });
      if (checkIsDone) {
        return {
          data: null,
          message: "Speaking skill is done",
          success: false,
          error: {
            message: "Speaking skill is done",
            errorDetail: "Speaking skill is done",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const examSpeakingQuestion = await this._context.ExamQuestionRepo.createQueryBuilder("examQuestion")
        .leftJoinAndSelect("examQuestion.question", "question")
        .where("examQuestion.examId = :examId", { examId: currentExam.id })
        .andWhere("question.skillId = :skillId", { skillId: "speaking" })
        .orderBy("examQuestion.levelId", "ASC")
        .getMany();

      const examSpeakingSubmited = await this._context.ExamResultSpeakingRepo.createQueryBuilder("examResultSpeaking")
        .innerJoinAndSelect("examResultSpeaking.examQuestion", "examQuestion")
        .where("examQuestion.examId = :examId", { examId: currentExam.id })
        .getMany();
      let currentExamSpeakingQuestion = null;
      for (let i = 0; i < examSpeakingQuestion.length; i++) {
        if (!examSpeakingSubmited.find((submitted) => submitted.examQuestionId === examSpeakingQuestion[i].id)) {
          currentExamSpeakingQuestion = examSpeakingQuestion[i];
          break;
        }
      }
      if (!currentExamSpeakingQuestion) {
        const examSkillStatus = await this._context.ExamSkillStatusRepo.findOne({
          where: {
            examId: currentExam.id,
            skillId: "speaking",
          },
        });
        examSkillStatus.status = EExamSkillStatus.FINISHED;
        await this._context.ExamSkillStatusRepo.save(examSkillStatus);
        return {
          data: null,
          message: "OK",
          success: true,
          status: StatusCodes.OK,
          error: null,
        };
      }
      return {
        data: currentExamSpeakingQuestion.questionId,
        message: "Get speaking question successfully",
        success: true,
        status: StatusCodes.OK,
        error: null,
      };
    } catch (error) {
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

  async getScoreOfExam(examId: string): Promise<IResponseBase> {
    try {
      if (!examId) {
        return {
          data: null,
          message: "ExamId is required",
          success: false,
          error: {
            message: "ExamId is required",
            errorDetail: "ExamId is required",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }
      const exam = await this._context.ExamRepo.createQueryBuilder("exam")
        .leftJoinAndSelect("exam.examSkillStatuses", "examSkillStatuses")
        .where("exam.id = :examId", { examId })
        .select([
          "exam.id",
          "exam.examCode",
          "exam.startTime",
          "exam.endTime",
          "examSkillStatuses.skillId",
          "examSkillStatuses.status",
          "examSkillStatuses.score",
          "examSkillStatuses.order",
          "examSkillStatuses.totalQuestion",
        ])
        .orderBy("examSkillStatuses.order", "ASC")
        .getOne();
      if (!exam) {
        return {
          data: null,
          message: "Exam not found",
          success: false,
          error: {
            message: "Exam not found",
            errorDetail: "Exam not found",
          },
          status: StatusCodes.NOT_FOUND,
        };
      }
      return {
        data: exam,
        message: "Get score of exam successfully",
        success: true,
        status: StatusCodes.OK,
        error: null,
      };
    } catch (error) {
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
  async getResultOfExam(examId: string, skillId: string = "listening"): Promise<IResponseBase> {
    try {
      if (!examId) {
        return {
          data: null,
          message: "ExamId is required",
          success: false,
          error: {
            message: "ExamId is required",
            errorDetail: "ExamId is required",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }
      if (!skillId) {
        return {
          data: null,
          message: "SkillId is required",
          success: false,
          error: {
            message: "SkillId is required",
            errorDetail: "SkillId is required",
          },
          status: StatusCodes.BAD_REQUEST,
        };
      }

      const currentExam = await this._context.ExamRepo.createQueryBuilder("exam")
        .where("exam.id = :examId", { examId })
        .andWhere("exam.isDeleted = :isDeleted", { isDeleted: false })
        .orderBy("exam.createdAt", "DESC")
        .getOne();
      const examSkillStatuses = await this._context.ExamSkillStatusRepo.createQueryBuilder("examSkillStatus")
        .innerJoinAndSelect("examSkillStatus.skill", "skill")
        .where("examSkillStatus.examId = :examId", { examId: currentExam.id })
        .orderBy("examSkillStatus.order", "ASC")
        .select([
          "examSkillStatus.id",
          "examSkillStatus.examId",
          "examSkillStatus.skillId",
          "examSkillStatus.startTime",
          "examSkillStatus.endTime",
          "examSkillStatus.status",
          "examSkillStatus.order",
          "skill.name",
          "skill.expiredTime",
        ])
        .getMany();
      if (!examSkillStatuses || examSkillStatuses.length === 0) {
        return {
          data: null,
          message: "No exam skill status found, please try again later",
          success: false,
          error: {
            message: "No exam skill status found, please try again later",
            errorDetail: "No exam skill status found",
          },
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        };
      }

      const currentSkillData = examSkillStatuses.find((examSkillStatus) => examSkillStatus.skillId === skillId);
      if (!currentSkillData) {
        return {
          data: null,
          message: "Skill not found",
          success: false,
          error: {
            message: "Skill not found",
            errorDetail: "Skill not found",
          },
          status: StatusCodes.NOT_FOUND,
        };
      }
      let resultOfSkill = null;
      if (skillId === "listening") {
        const listeningResult = await this._context.ExamQuestionRepo.createQueryBuilder("examQuestion")
          .innerJoinAndSelect("examQuestion.question", "questions")
          .innerJoinAndSelect("questions.skill", "skill")
          .innerJoinAndSelect("questions.level", "level")
          .leftJoinAndSelect("questions.subQuestions", "subQuestions")
          .leftJoinAndSelect("subQuestions.answers", "answers")
          .leftJoinAndSelect("examQuestion.examResultListenings", "results")
          .where("examQuestion.examId = :examId", { examId: currentExam.id })
          .andWhere("questions.skillId = :skillId", { skillId })
          .select([
            "examQuestion.id",
            "examQuestion.examId",
            "examQuestion.questionId",
            "questions.id",
            "questions.levelId",
            "questions.questionContent",
            "questions.questionNote",
            "questions.description",
            "questions.attachedFile",
            "skill.id",
            "skill.name",
            "skill.displayName",
            "level.id",
            "level.displayName",
            "level.description",
            "level.subQuestionNumber",
            "subQuestions.id",
            "subQuestions.content",
            "subQuestions.order",
            "subQuestions.correctAnswer",
            "answers.id",
            "answers.answerContent",
            "answers.order",
            "answers.isCorrect",
            "results",
          ])
          .orderBy("questions.levelId", "ASC")
          .addOrderBy("subQuestions.order", "ASC")
          .addOrderBy("answers.order", "ASC")
          .getMany();
        const result = listeningResult.map((result) => {
          const newResult = {
            ...result,
            results: result.question.subQuestions.map((subquestion) => {
              const subQuestionResult = result.examResultListenings.find((result) => result.subQuestionId === subquestion.id);
              if (subQuestionResult) {
                return {
                  id: subQuestionResult.id,
                  question: subQuestionResult.subQuestionId,
                  answer: subQuestionResult.answerId,
                  point: null,
                  feedback: null,
                  isRated: false,
                };
              }
              return {
                id: null,
                subQuestion: subquestion.id,
                answer: null,
                point: null,
                feedback: null,
                isRated: false,
              };
            }),
          };
          delete newResult.examResultListenings;
          return newResult;
        });
        resultOfSkill = result;
      }
      if (skillId === "reading") {
        const readingResult = await this._context.ExamQuestionRepo.createQueryBuilder("examQuestion")
          .innerJoinAndSelect("examQuestion.question", "questions")
          .innerJoinAndSelect("questions.skill", "skill")
          .innerJoinAndSelect("questions.level", "level")
          .leftJoinAndSelect("questions.subQuestions", "subQuestions")
          .leftJoinAndSelect("subQuestions.answers", "answers")
          .leftJoinAndSelect("examQuestion.examResultReadings", "results") // Dùng alias "results" thay vì "examResultListenings"
          .where("examQuestion.examId = :examId", { examId: currentExam.id })
          .andWhere("questions.skillId = :skillId", { skillId })
          .select([
            "examQuestion.id",
            "examQuestion.examId",
            "examQuestion.questionId",
            "questions.id",
            "questions.levelId",
            "questions.questionContent",
            "questions.questionNote",
            "questions.description",
            "questions.attachedFile",
            "skill.id",
            "skill.name",
            "skill.displayName",
            "level.id",
            "level.displayName",
            "level.description",
            "level.subQuestionNumber",
            "subQuestions.id",
            "subQuestions.content",
            "subQuestions.order",
            "subQuestions.correctAnswer",
            "answers.id",
            "answers.answerContent",
            "answers.order",
            "answers.isCorrect",
            "results",
          ])
          .orderBy("questions.levelId", "ASC")
          .addOrderBy("subQuestions.order", "ASC")
          .addOrderBy("answers.order", "ASC")
          .getMany();
        const result = readingResult.map((result) => {
          const newResult = {
            ...result,
            results: result.question.subQuestions.map((subquestion) => {
              const subQuestionResult = result.examResultReadings.find((result) => result.subQuestionId === subquestion.id);
              if (subQuestionResult) {
                return {
                  id: subQuestionResult.id,
                  question: subQuestionResult.subQuestionId,
                  answer: subQuestionResult.answerId,
                  point: null,
                  feedback: null,
                  isRated: false,
                };
              }
              return {
                id: null,
                question: subquestion.id,
                answer: null,
                point: null,
                feedback: null,
                isRated: false,
              };
            }),
          };
          delete newResult.examResultReadings;
          return newResult;
        });
        resultOfSkill = result;
      }
      if (skillId === "writing") {
        const writingResult = await this._context.ExamQuestionRepo.createQueryBuilder("examQuestion")
          .innerJoinAndSelect("examQuestion.question", "questions")
          .innerJoinAndSelect("questions.skill", "skill")
          .innerJoinAndSelect("questions.level", "level")
          .leftJoinAndSelect("examQuestion.examResultWritings", "results")
          .where("examQuestion.examId = :examId", { examId: currentExam.id })
          .andWhere("questions.skillId = :skillId", { skillId })
          .select([
            "examQuestion.id",
            "examQuestion.examId",
            "examQuestion.questionId",
            "questions.id",
            "questions.levelId",
            "questions.questionContent",
            "questions.questionNote",
            "questions.description",
            "questions.attachedFile",
            "skill.id",
            "skill.name",
            "skill.displayName",
            "level.id",
            "level.displayName",
            "level.description",
            "level.subQuestionNumber",
            "results",
          ])
          .orderBy("questions.levelId", "ASC")
          .getMany();
        const result = writingResult.map((result) => {
          const newResult = {
            ...result,
            results: result.examResultWritings.map((writing) => {
              return {
                id: writing.id,
                question: writing.examQuestionId,
                answer: writing.data,
                feedback: writing.feedback,
                point: null,
                isRated: false,
              };
            }),
          };
          delete newResult.examResultWritings;
          return newResult;
        });
        resultOfSkill = result;
      }
      if (skillId === "speaking") {
        const speakingResult = await this._context.ExamQuestionRepo.createQueryBuilder("examQuestion")
          .innerJoinAndSelect("examQuestion.question", "questions")
          .innerJoinAndSelect("questions.skill", "skill")
          .innerJoinAndSelect("questions.level", "level")
          .leftJoinAndSelect("examQuestion.examResultSpeakings", "results") // Dùng alias "results" thay vì "examResultListenings"
          .where("examQuestion.examId = :examId", { examId: currentExam.id })
          .andWhere("questions.skillId = :skillId", { skillId })
          .select([
            "examQuestion.id",
            "examQuestion.examId",
            "examQuestion.questionId",
            "questions.id",
            "questions.levelId",
            "questions.questionContent",
            "questions.questionNote",
            "questions.description",
            "questions.attachedFile",
            "skill.id",
            "skill.name",
            "skill.displayName",
            "level.id",
            "level.displayName",
            "level.description",
            "level.subQuestionNumber",
            "results",
          ])
          .orderBy("questions.levelId", "ASC")
          .getMany();
        const result = speakingResult.map((result) => {
          const newResult = {
            ...result,
            results: result.examResultSpeakings.map((speaking) => {
              return {
                id: speaking.id,
                question: speaking.examQuestionId,
                answer: speaking.data,
                feedback: speaking.feedback,
                point: null,
                isRated: false,
              };
            }),
          };
          delete newResult.examResultSpeakings;
          return newResult;
        });
        resultOfSkill = result;
      }

      return {
        data: {
          exam: currentExam,
          skill: currentSkillData,
          questions: resultOfSkill,
        },
        message: "Continue with the last exam",
        success: true,
        status: StatusCodes.OK,
        error: null,
      };
    } catch (error) {
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
  async getMyExams(): Promise<IResponseBase> {
    try {
      const request = RequestStorage.getStore()?.get(LocalStorage.REQUEST_STORE);
      const userId = request?.user.id;
      if (!userId) {
        return {
          status: StatusCodes.UNAUTHORIZED,
          success: false,
          message: "Bạn không có quyền truy cập",
          data: null,
          error: {
            message: "Unauthorized",
            errorDetail: "Bạn không có quyền truy cập",
          },
        };
      }
      const exams = await this._context.ExamRepo.createQueryBuilder("exam")
        .where("exam.userId = :userId", { userId })
        .innerJoinAndSelect("exam.examSkillStatuses", "examSkillStatuses")
        .andWhere("exam.isDeleted = :isDeleted", { isDeleted: false })
        .orderBy("exam.createdAt", "DESC")
        .select([
          "exam.id",
          "exam.examCode",
          "exam.startTime",
          "exam.endTime",
          "exam.isDone",
          "examSkillStatuses.skillId",
          "examSkillStatuses.status",
          "examSkillStatuses.score",
          "examSkillStatuses.order",
          "examSkillStatuses.totalQuestion",
        ])
        .getMany();
      return {
        data: exams,
        message: "Get my exams successfully",
        success: true,
        status: StatusCodes.OK,
        error: null,
      };
    } catch (error) {
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
