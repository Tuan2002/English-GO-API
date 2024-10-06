import { ErrorMessages } from "@/constants/ErrorMessages";
import AppDataSource from "@/data-source";
import { Answer } from "@/entity/Answer";
import { Question } from "@/entity/Question";
import { SubQuestion } from "@/entity/SubQuestion";
import { IResponseBase } from "@/interfaces/base/IResponseBase";
import IQuestionService from "@/interfaces/question/IQuestionService";
import { IQuestionData } from "@/interfaces/question/QuestionDTO";
import { Repo } from "@/repository";
import { StatusCodes } from "http-status-codes";

export default class QuestionService implements IQuestionService {
  constructor() {
    // Constructor
  }

  async checkQuestionData(questionData: IQuestionData) {
    if (!questionData || !questionData.questionContent || !questionData.questionContent.trim()) {
      return {
        data: null,
        message: "Question content is required",
        success: false,
        error: {
          message: "Question content is required",
          errorDetail: "Question content is required",
        },
        status: StatusCodes.BAD_REQUEST,
      };
    }
    if (!questionData.skillId || !questionData.levelId || !questionData.categoryId) {
      return {
        data: null,
        message: ErrorMessages.INVALID_REQUEST_BODY,
        success: false,
        error: {
          message: ErrorMessages.INVALID_REQUEST_BODY,
          errorDetail: "SkillId, LevelId and CategoryId is required",
        },
        status: StatusCodes.BAD_REQUEST,
      };
    }
    const level = await Repo.LevelRepo.findOne({
      where: {
        id: questionData.levelId,
      },
    });
    if (!level) {
      return {
        data: null,
        message: "Level is not exist",
        success: false,
        error: {
          message: "Level is not exist",
          errorDetail: "Level is not exist",
        },
        status: StatusCodes.BAD_REQUEST,
      };
    }
    if (questionData.subQuestions?.length !== level.subQuestionNumber) {
      return {
        data: null,
        message: `SubQuestion number must be equal to ${level.subQuestionNumber}`,
        success: false,
        error: {
          message: `SubQuestion number must be equal to ${level.subQuestionNumber}`,
          errorDetail: `SubQuestion number must be equal to ${level.subQuestionNumber}`,
        },
        status: StatusCodes.BAD_REQUEST,
      };
    }
    const checkSubQuestionContent = questionData.subQuestions?.some(
      (subQuestion) => !subQuestion.content || !subQuestion.content.trim()
    );
    if (checkSubQuestionContent) {
      return {
        data: null,
        message: "Please fill all sub question content",
        success: false,
        error: {
          message: "Please fill all sub question content",
          errorDetail: "Please fill all sub question content",
        },
        status: StatusCodes.BAD_REQUEST,
      };
    }
    const checkSubQuestionAnswerContent = questionData.subQuestions?.some(
      (subQuestion) =>
        !subQuestion.answers ||
        subQuestion.answers.length === 0 ||
        subQuestion.answers.some((answer) => !answer.answerContent || !answer.answerContent.trim())
    );
    if (checkSubQuestionAnswerContent) {
      return {
        data: null,
        message: "Please fill all sub question answer content",
        success: false,
        error: {
          message: "Please fill all sub question answer content",
          errorDetail: "Please fill all sub question answer content",
        },
        status: StatusCodes.BAD_REQUEST,
      };
    }
    const checkSubQuestionAnswerCorrect = questionData.subQuestions?.some(
      (subQuestion) => !subQuestion.correctAnswer || !subQuestion.correctAnswer.trim()
    );
    if (checkSubQuestionAnswerCorrect) {
      return {
        data: null,
        message: "Please fill all sub question correct answer",
        success: false,
        error: {
          message: "Please fill all sub question correct answer",
          errorDetail: "Please fill all sub question correct answer",
        },
        status: StatusCodes.BAD_REQUEST,
      };
    }
    if ((questionData.skillId === "listening" && !questionData.attachedFile) || !questionData.attachedFile.trim()) {
      return {
        data: null,
        message: "Please upload file audio for listening question",
        success: false,
        error: {
          message: "Please upload file audio for listening question",
          errorDetail: "Attached file is required",
        },
        status: StatusCodes.BAD_REQUEST,
      };
    }
    return {
      data: null,
      message: "Check question data successfully",
      success: true,
      error: null,
      status: StatusCodes.OK,
    };
  }

  // async createNewQuestion(questionData: IQuestionData, userId: string): Promise<IResponseBase> {
  //   try {
  //     const checkQuestionData = await this.checkQuestionData(questionData);
  //     if (checkQuestionData.success === false) {
  //       return checkQuestionData;
  //     }
  //     const queryRunner = AppDataSource.createQueryRunner();
  //     await queryRunner.connect();
  //     await queryRunner.startTransaction();
  //     try {
  //       const question = new Question();
  //       question.id = questionData.id;
  //       question.skillId = questionData.skillId;
  //       question.levelId = questionData.levelId;
  //       question.categoryId = questionData.categoryId;
  //       question.questionContent = questionData.questionContent;
  //       question.questionNote = questionData.questionNote;
  //       question.description = questionData.questionDescription;
  //       question.attachedFile = questionData.attachedFile;
  //       question.isDeleted = false;
  //       question.isActive = true;
  //       question.createdBy = userId;
  //       question.updatedBy = userId;

  //       const savedQuestion = await queryRunner.manager.save(Question, question);

  //       questionData.subQuestions?.forEach(async (subQuestion) => {
  //         const newSubQuestion = new SubQuestion();
  //         newSubQuestion.id = subQuestion.id;
  //         newSubQuestion.content = subQuestion.content;
  //         newSubQuestion.question = savedQuestion;
  //         newSubQuestion.createdBy = userId;
  //         newSubQuestion.updatedBy = userId;
  //         newSubQuestion.isDeleted = false;
  //         newSubQuestion.isActive = true;
  //         newSubQuestion.correctAnswer = subQuestion.correctAnswer;

  //         const savedSubQuestion = await queryRunner.manager.save(SubQuestion, newSubQuestion);

  //         subQuestion.answers?.forEach(async (answer) => {
  //           const newAnswer = new Answer();
  //           newAnswer.id = answer.id;
  //           newAnswer.answerContent = answer.answerContent;
  //           newAnswer.subQuestion = savedSubQuestion;
  //           newAnswer.createdBy = userId;
  //           newAnswer.updatedBy = userId;
  //           newAnswer.isCorrect = answer.isCorrect;

  //           await queryRunner.manager.save(Answer, newAnswer);
  //         });
  //       });
  //       await queryRunner.commitTransaction();
  //       return {
  //         data: savedQuestion,
  //         message: "Create new question successfully",
  //         success: true,
  //         error: null,
  //         status: StatusCodes.CREATED,
  //       };
  //     } catch (error) {
  //       await queryRunner.rollbackTransaction();
  //       return {
  //         data: null,
  //         message: ErrorMessages.INTERNAL_SERVER_ERROR,
  //         success: false,
  //         error: {
  //           message: error.message,
  //           errorDetail: error.message,
  //         },
  //         status: StatusCodes.INTERNAL_SERVER_ERROR,
  //       };
  //     } finally {
  //       await queryRunner.release();
  //     }
  //   } catch (error) {
  //     return {
  //       data: null,
  //       message: ErrorMessages.INTERNAL_SERVER_ERROR,
  //       success: false,
  //       error: {
  //         message: error.message,
  //         errorDetail: error.message,
  //       },
  //       status: StatusCodes.INTERNAL_SERVER_ERROR,
  //     };
  //   }
  // }
  async createNewQuestion(questionData: IQuestionData, userId: string): Promise<IResponseBase> {
    const checkQuestionData = await this.checkQuestionData(questionData);
    if (checkQuestionData.success === false) {
      return checkQuestionData;
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const question = new Question();
      question.id = questionData.id; // Ensure questionData.id is provided
      question.skillId = questionData.skillId;
      question.levelId = questionData.levelId;
      question.categoryId = questionData.categoryId;
      question.questionContent = questionData.questionContent;
      question.questionNote = questionData.questionNote;
      question.description = questionData.questionDescription;
      question.attachedFile = questionData.attachedFile;
      question.isDeleted = false;
      question.isActive = true;
      question.createdBy = userId;
      question.updatedBy = userId;

      const savedQuestion = await queryRunner.manager.insert(Question, question);

      // Thay thế forEach bằng Promise.all
      await Promise.all(
        questionData.subQuestions?.map(async (subQuestion) => {
          const newSubQuestion = new SubQuestion();
          newSubQuestion.id = subQuestion.id; // Ensure subQuestion.id is provided
          newSubQuestion.content = subQuestion.content;
          // newSubQuestion.question = savedQuestion;
          newSubQuestion.questionId = savedQuestion.identifiers[0].id;
          newSubQuestion.order = subQuestion.order;
          newSubQuestion.createdBy = userId;
          newSubQuestion.updatedBy = userId;
          newSubQuestion.isDeleted = false;
          newSubQuestion.isActive = true;
          newSubQuestion.correctAnswer = subQuestion.correctAnswer;

          const savedSubQuestion = await queryRunner.manager.insert(SubQuestion, newSubQuestion);

          // Lưu các Answer
          await Promise.all(
            subQuestion.answers?.map(async (answer) => {
              const newAnswer = new Answer();
              newAnswer.id = answer.id; // Ensure answer.id is provided
              newAnswer.answerContent = answer.answerContent;
              // newAnswer.subQuestion = savedSubQuestion;
              newAnswer.subQuestionId = savedSubQuestion.identifiers[0].id;
              newAnswer.order = answer.order;
              newAnswer.createdBy = userId;
              newAnswer.updatedBy = userId;
              newAnswer.isCorrect = answer.isCorrect;

              await queryRunner.manager.save(Answer, newAnswer);
            })
          );
        })
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        data: savedQuestion,
        message: "Create new question successfully",
        success: true,
        error: null,
        status: StatusCodes.CREATED,
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
}
