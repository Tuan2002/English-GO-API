import { ErrorMessages } from "@/constants/ErrorMessages";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import IExamService from "@/interfaces/exam/IExamService";
import ILevelService from "@/interfaces/level/ILevelService";
import { StatusCodes } from "http-status-codes";
import LevelService from "../level/LevelService";
import { Repo } from "@/repository";
import AppDataSource from "@/data-source";
import { Exam } from "@/entity/Exam";
import { v4 as uuidv4 } from "uuid";
import { ExamSkillStatus } from "@/entity/ExamSkillStatus";
import { ExamQuestion } from "@/entity/ExamQuestion";
import { EExamSkillStatus } from "@/interfaces/exam/IExamDTO";

export default class ExamServices implements IExamService {
  private _levelService: ILevelService;
  constructor() {
    this._levelService = new LevelService();
    // Constructor
  }
  async getCurrentExam(userId: string): Promise<IResponseBase> {
    try {
      const lastExam = await Repo.ExamRepo.createQueryBuilder("exam")
        .where("exam.userId = :userId", { userId })
        .andWhere("exam.isDeleted = :isDeleted", { isDeleted: false })
        .orderBy("exam.createdAt", "DESC")
        .getOne();
      if (
        // if there is no exam yet, create a new one
        !lastExam ||
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
        data: lastExam,
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
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const levels = await this._levelService.getAllLevels();
      if (!levels || !levels.success) {
        return levels;
      }
      const groupedQuestions = await Repo.QuestionRepo.createQueryBuilder("question")
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
      const questionIdAfterRandom = groupedQuestions.map((groupedQuestion) => {
        const questionLength = groupedQuestion.questionids.length;
        const questionId = groupedQuestion.questionids[Math.floor(Math.random() * questionLength)];
        return questionId;
      });
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
      const skills = ["listening", "reading", "writing", "speaking"];
      skills.forEach(async (skill, index) => {
        const examSkillStatus = new ExamSkillStatus();
        examSkillStatus.examId = examCreated.id;
        examSkillStatus.id = uuidv4();
        examSkillStatus.startTime = new Date().getTime().toString();
        examSkillStatus.endTime = (new Date().getTime() + 50 * 60 * 1000).toString();
        examSkillStatus.skillId = skill;
        examSkillStatus.score = 0;
        examSkillStatus.order = index;
        examSkillStatus.status = EExamSkillStatus.NOT_STARTED; // "PENDING" | "COMPLETED" | "MAKING"
        await queryRunner.manager.save(ExamSkillStatus, examSkillStatus);
      });

      // thêm câu hỏi vào bảng exam_question
      questionIdAfterRandom.forEach(async (questionId) => {
        const examQuestion = new ExamQuestion();
        examQuestion.examId = examCreated.id;
        examQuestion.id = uuidv4();
        examQuestion.questionId = questionId;
        await queryRunner.manager.save(ExamQuestion, examQuestion);
      });
      await queryRunner.commitTransaction();
      return {
        data: examCreated,
        message: "Start with a new exam",
        success: true,
        status: StatusCodes.OK,
        error: null,
      };
    } catch (error) {
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
    } finally {
      await queryRunner.release();
    }
  }

  async participateExam(userId: string): Promise<IResponseBase> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lastExam = await Repo.ExamRepo.createQueryBuilder("exam")
        .where("exam.userId = :userId", { userId })
        .andWhere("exam.isDeleted = :isDeleted", { isDeleted: false })
        .orderBy("exam.createdAt", "DESC")
        .getOne();
      if (
        // if there is no exam yet, create a new one
        !lastExam ||
        // if the last exam is not done yet or the end time is over
        (lastExam && lastExam.isDone) ||
        // if the last exam is done but the end time is over
        (lastExam && new Date(parseInt(lastExam.endTime)) < new Date())
      ) {
        const createdExam = await this.startNewExam(userId);
        if (!createdExam || !createdExam.success) {
          return createdExam;
        }
        return createdExam;
      }
      return {
        data: lastExam,
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

  async continueExam(userId: string): Promise<IResponseBase> {
    try {
      const exam = await this.getCurrentExam(userId);
      if (!exam || !exam.success || !exam.data) {
        return exam;
      }
      const currentExam = exam.data;
      const examSkillStatuses = await Repo.ExamSkillStatusRepo.createQueryBuilder("examSkillStatus")
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
        await Repo.ExamSkillStatusRepo.save(currentSkillData);
      }

      const listQuestionOfCurrentExamSkill = await Repo.ExamQuestionRepo.createQueryBuilder("examQuestion")
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
}
