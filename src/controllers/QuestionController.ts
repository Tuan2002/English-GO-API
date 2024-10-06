import IQuestionService from "@/interfaces/question/IQuestionService";
import QuestionService from "@/services/question/QuestionService";
import { Request, Response } from "express";

export class QuestionController {
  private _questionService: IQuestionService;
  constructor() {
    this._questionService = new QuestionService();
  }
  async createNewQuestion(req: Request, res: Response) {
    const questionData = req.body;
    const { id } = req.user;
    const question = await this._questionService.createNewQuestion(questionData, id);
    return res.status(question.status).json(question);
  }
}
