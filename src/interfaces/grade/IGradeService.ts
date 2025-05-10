import { IResponseBase } from "../base/IResponseBase";
import {
  ICheckRegisterGradingWithPersonRequest,
  IGradeExamWithPersonRequest,
  IGradeQuestionRequest,
  IGradeQuestionWithPersonRequest,
} from "./IGradeDTO";

export default interface IGradeService {
  gradeWritingWithAI(data: IGradeQuestionRequest): Promise<IResponseBase>;
  gradeSpeakingWithAI(data: IGradeQuestionRequest): Promise<IResponseBase>;
  getGradingFeedbackWithAI(examId: string, skillId: string): Promise<IResponseBase>;
  registerGradingExamWithPerson(data: IGradeExamWithPersonRequest): Promise<IResponseBase>;
  checkRegisterGradingExamWithPerson(data: ICheckRegisterGradingWithPersonRequest): Promise<IResponseBase>;
  getListRegisteredGradeExamByExaminer(examinerId: string): Promise<IResponseBase>;
  getGradingFeedbackWithPerson(registerGradeExamId: string): Promise<IResponseBase>;
  gradeQuestionWithPerson(gradeData: IGradeQuestionWithPersonRequest): Promise<IResponseBase>;
}
