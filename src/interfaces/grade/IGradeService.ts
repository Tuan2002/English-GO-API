import { IResponseBase } from "../base/IResponseBase";
import { IGradeQuestionRequest } from "./IGradeDTO";

export default interface IGradeService {
  gradeWritingWithAI(data: IGradeQuestionRequest): Promise<IResponseBase>;
  gradeSpeakingWithAI(data: IGradeQuestionRequest): Promise<IResponseBase>;
  getGradingFeedbackWithAI(examId: string, skillId: string): Promise<IResponseBase>;
}
