import { IResponseBase } from "../base/IResponseBase";
import { IQuestionData } from "./QuestionDTO";

export default interface IQuestionService {
  createNewQuestion: (questionData: IQuestionData, userId: string) => Promise<IResponseBase>;
}
