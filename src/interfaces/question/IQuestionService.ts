import { IResponseBase } from "../base/IResponseBase";
import { IQuestionDetail } from "./QuestionDTO";

export default interface IQuestionService {
  createNewQuestion: (questionData: IQuestionDetail, userId: string) => Promise<IResponseBase>;
  updateQuestion: (questionData: IQuestionDetail, userId: string) => Promise<IResponseBase>;
  getAllQuestions: () => Promise<IResponseBase>;
  getQuestionDetail: (questionId: string) => Promise<IResponseBase>;
  getAllQuestionByCategoryId: (categoryId: string, isActive?: boolean) => Promise<IResponseBase>;
  getAllQuestionBySkillId: (skillId: string) => Promise<IResponseBase>;
  getAllQuestionByLevelId: (levelId: string) => Promise<IResponseBase>;
  getQuestionById: (questionId: string) => Promise<IResponseBase>;
  deleteQuestion: (questionId: string) => Promise<IResponseBase>;
  restoreQuestion: (questionId: string) => Promise<IResponseBase>;
  activeQuestion: (questionId: string) => Promise<IResponseBase>;
  inactiveQuestion: (questionId: string) => Promise<IResponseBase>;
  deleteQuestionPermanently: (questionId: string) => Promise<IResponseBase>;
}
