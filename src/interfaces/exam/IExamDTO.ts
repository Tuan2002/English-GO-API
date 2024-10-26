import { IQuestionDetail } from "../question/QuestionDTO";

export enum EExamSkillStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

export interface ISubmitSkillRequest {
  skillId: string;
  questions: IQuestionDetail[];
}
