export interface IGradeQuestionRequest {
  examId: string;
  levelId: string;
}

export interface IGradeQuestionWithPersonRequest {
  levelId: string;
  skillId: string;
  examId: string;
  examinerId: string;
  score: string;
  feedback: string;
  registerGradeExamId: string;
}

export interface ICheckRegisterGradingWithPersonRequest {
  examId: string;
  skillId: string;
  contestantId: string;
}

export interface IGradeExamWithPersonRequest {
  examId: string;
  skillId: string;
  examinerId: string;
  contestantId: string;
}

export interface IGetGradeFeedback {
  examId: string;
  skillId: string;
}
