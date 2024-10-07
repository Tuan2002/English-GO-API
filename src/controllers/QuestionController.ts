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
  async getAllQuestions(req: Request, res: Response) {
    const questions = await this._questionService.getAllQuestions();
    return res.status(questions.status).json(questions);
  }
  async getAllQuestionByCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const { status } = req.query;
    const isActive = status === "active" ? true : status === "inactive" ? false : undefined;
    const questions = await this._questionService.getAllQuestionByCategoryId(categoryId, isActive);
    return res.status(questions.status).json(questions);
  }
  async getAllQuestionBySkill(req: Request, res: Response) {
    const { skillId } = req.params;
    const questions = await this._questionService.getAllQuestionBySkillId(skillId);
    return res.status(questions.status).json(questions);
  }
  async getAllQuestionByLevel(req: Request, res: Response) {
    const { levelId } = req.params;
    const questions = await this._questionService.getAllQuestionByLevelId(levelId);
    return res.status(questions.status).json(questions);
  }
  async getQuestionDetail(req: Request, res: Response) {
    const { questionId } = req.params;
    const question = await this._questionService.getQuestionDetail(questionId);
    return res.status(question.status).json(question);
  }
  async updateQuestion(req: Request, res: Response) {
    const questionData = req.body;
    const { id } = req.user;
    const question = await this._questionService.updateQuestion(questionData, id);
    return res.status(question.status).json(question);
  }
  async deleteQuestion(req: Request, res: Response) {
    const { questionId } = req.params;
    const question = await this._questionService.deleteQuestion(questionId);
    return res.status(question.status).json(question);
  }
  async restoreQuestion(req: Request, res: Response) {
    const { questionId } = req.params;
    const question = await this._questionService.restoreQuestion(questionId);
    return res.status(question.status).json(question);
  }
  async activeQuestion(req: Request, res: Response) {
    const { questionId } = req.params;
    const question = await this._questionService.activeQuestion(questionId);
    return res.status(question.status).json(question);
  }
  async inactiveQuestion(req: Request, res: Response) {
    const { questionId } = req.params;
    const question = await this._questionService.inactiveQuestion(questionId);
    return res.status(question.status).json(question);
  }
  async deleteQuestionPermanently(req: Request, res: Response) {
    const { questionId } = req.params;
    const question = await this._questionService.deleteQuestionPermanently(questionId);
    return res.status(question.status).json(question);
  }
}
