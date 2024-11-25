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
import { EExamSkillStatus, ISubmitSkillRequest } from "@/interfaces/exam/IExamDTO";
import { ExamResultReading } from "@/entity/ExamResultReading";
import { ExamResultListening } from "@/entity/ExamResultListening";
import { ExamResultWriting } from "@/entity/ExamResultWriting";
import { ExamResultSpeaking } from "@/entity/ExamResultSpeaking";
import { IQuestionDetail, ISpeakingQuestionSubmit } from "@/interfaces/question/QuestionDTO";

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
      const examSkillStatuses = await Repo.ExamSkillStatusRepo.createQueryBuilder("examSkillStatus")
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
      const questionAfterRandom = groupedQuestions.map((groupedQuestion) => {
        const questionLength = groupedQuestion.questionids.length;
        const questionId = groupedQuestion.questionids[Math.floor(Math.random() * questionLength)];
        return {
          levelId: groupedQuestion.levelid,
          questionId,
        };
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
      questionAfterRandom.forEach(async (question) => {
        const examQuestion = new ExamQuestion();
        examQuestion.examId = examCreated.id;
        examQuestion.id = uuidv4();
        examQuestion.questionId = question.questionId;
        examQuestion.levelId = question.levelId;
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
      // levelId
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
    // const queryRunner = AppDataSource.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();

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
    const skillData = await Repo.SkillRepo.createQueryBuilder("skill")
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
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (skillId === "reading") {
        // do something
        let score = 0;
        questions.forEach(async (question) => {
          const examQuestion = await Repo.ExamQuestionRepo.findOne({
            where: {
              levelId: question.levelId,
            },
          });
          question.subQuestions.forEach(async (subquestion) => {
            if (subquestion.selectedAnswerId) {
              const subQuestionScore = await Repo.SubQuesionRepo.findOne({
                where: {
                  id: subquestion.id,
                },
              });
              if (subquestion.selectedAnswerId === subQuestionScore.correctAnswer) {
                score += 1;
              }
              const examResultReading = new ExamResultReading();
              examResultReading.id = uuidv4();
              examResultReading.examQuestionId = examQuestion.id;
              examResultReading.subQuestionId = subquestion.id;
              examResultReading.answerId = subquestion.selectedAnswerId;

              await queryRunner.manager.save(ExamResultReading, examResultReading);
            }
          });
        });
        const examSkillStatus = await Repo.ExamSkillStatusRepo.findOne({
          where: {
            examId: currentExamData.data.exam.id,
            skillId,
          },
        });
        examSkillStatus.status = EExamSkillStatus.FINISHED;
        examSkillStatus.score = score;
        await queryRunner.manager.save(ExamSkillStatus, examSkillStatus);
      }
      if (skillId === "listening") {
        // do something
        let score = 0;
        questions.forEach(async (question) => {
          const examQuestion = await Repo.ExamQuestionRepo.findOne({
            where: {
              levelId: question.levelId,
            },
          });
          question.subQuestions.forEach(async (subquestion) => {
            if (subquestion.selectedAnswerId) {
              const subQuestionScore = await Repo.SubQuesionRepo.findOne({
                where: {
                  id: subquestion.id,
                },
              });
              if (subquestion.selectedAnswerId === subQuestionScore.correctAnswer) {
                score += 1;
              }
              const examResultListening = new ExamResultListening();
              examResultListening.id = uuidv4();
              examResultListening.examQuestionId = examQuestion.id;
              examResultListening.subQuestionId = subquestion.id;
              examResultListening.answerId = subquestion.selectedAnswerId;
              await queryRunner.manager.save(ExamResultListening, examResultListening);
            }
          });
        });
        const examSkillStatus = await Repo.ExamSkillStatusRepo.findOne({
          where: {
            examId: currentExamData.data.exam.id,
            skillId,
          },
        });
        examSkillStatus.status = EExamSkillStatus.FINISHED;
        examSkillStatus.score = score;
        await queryRunner.manager.save(ExamSkillStatus, examSkillStatus);
      }
      if (skillId === "writing") {
        // do something
        questions.forEach(async (question) => {
          const examQuestion = await Repo.ExamQuestionRepo.findOne({
            where: {
              levelId: question.levelId,
            },
          });
          const examResultWriting = new ExamResultWriting();
          examResultWriting.id = uuidv4();
          examResultWriting.examQuestionId = examQuestion.id;
          examResultWriting.data = question.questionData ?? "";
          examResultWriting.feedback = "";
          await queryRunner.manager.save(ExamResultWriting, examResultWriting);
        });
        const examSkillStatus = await Repo.ExamSkillStatusRepo.findOne({
          where: {
            examId: currentExamData.data.exam.id,
            skillId,
          },
        });
        examSkillStatus.status = EExamSkillStatus.FINISHED;
        await queryRunner.manager.save(ExamSkillStatus, examSkillStatus);
      }
      if (skillId === "speaking") {
        // do something
        questions.forEach(async (question) => {
          const examQuestion = await Repo.ExamQuestionRepo.findOne({
            where: {
              levelId: question.levelId,
            },
          });
          const examResultSpeaking = new ExamResultSpeaking();
          examResultSpeaking.id = uuidv4();
          examResultSpeaking.examQuestionId = examQuestion.id;
          examResultSpeaking.data = question.questionData;
          examResultSpeaking.feedback = "";
          await queryRunner.manager.save(ExamResultSpeaking, examResultSpeaking);
        });
        const examSkillStatus = await Repo.ExamSkillStatusRepo.findOne({
          where: {
            examId: currentExamData.data.exam.id,
            skillId,
          },
        });
        examSkillStatus.status = EExamSkillStatus.FINISHED;
        await queryRunner.manager.save(ExamSkillStatus, examSkillStatus);
      }
      await queryRunner.commitTransaction();
      return {
        data: null,
        message: "Submit successfully",
        success: true,
        status: StatusCodes.OK,
        error: null,
      };
    } catch (error) {
      queryRunner.rollbackTransaction();
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

      const examQuestion = await Repo.ExamQuestionRepo.findOne({
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

      const checkIsSubmitted = await Repo.ExamResultSpeakingRepo.findOne({
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
      const submited = await Repo.ExamResultSpeakingRepo.save(examResultSpeaking);

      const checkIsDone = await Repo.ExamResultSpeakingRepo.createQueryBuilder("examResultSpeaking")
        .innerJoinAndSelect("examResultSpeaking.examQuestion", "examQuestion")
        .where("examQuestion.examId = :examId", { examId: exam.id })
        .getMany();
      if (checkIsDone.length === 3) {
        const examSkillStatus = await Repo.ExamSkillStatusRepo.findOne({
          where: {
            examId: exam.id,
            skillId,
          },
        });
        examSkillStatus.status = EExamSkillStatus.FINISHED;
        await Repo.ExamSkillStatusRepo.save(examSkillStatus);
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
      const checkIsDone = await Repo.ExamSkillStatusRepo.findOne({
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
      const examSpeakingQuestion = await Repo.ExamQuestionRepo.createQueryBuilder("examQuestion")
        .leftJoinAndSelect("examQuestion.question", "question")
        .where("examQuestion.examId = :examId", { examId: currentExam.id })
        .andWhere("question.skillId = :skillId", { skillId: "speaking" })
        .orderBy("examQuestion.levelId", "ASC")
        .getMany();

      const examSpeakingSubmited = await Repo.ExamResultSpeakingRepo.createQueryBuilder("examResultSpeaking")
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
        const examSkillStatus = await Repo.ExamSkillStatusRepo.findOne({
          where: {
            examId: currentExam.id,
            skillId: "speaking",
          },
        });
        examSkillStatus.status = EExamSkillStatus.FINISHED;
        await Repo.ExamSkillStatusRepo.save(examSkillStatus);
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
      const exam = await Repo.ExamRepo.createQueryBuilder("exam")
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
          "examSkillStatuses.totalQuestion",
        ])
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
}
