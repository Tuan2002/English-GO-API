import IExamService from "@/interfaces/exam/IExamService";
import ExamServices from "@/services/exam/ExamServices";
import { Request, Response } from "express";
export class ExamController {
  private _examService: IExamService;
  constructor() {
    // Constructor
    this._examService = new ExamServices();
  }
  async getCurrentExam(req: Request, res: Response) {
    const userId = req.user.id;
    const response = await this._examService.getCurrentExam(userId);
    return res.status(response.status).json(response);
  }
  async startNewExam(req: Request, res: Response) {
    const userId = req.user.id;
    const response = await this._examService.startNewExam(userId);
    return res.status(response.status).json(response);
  }
  async participateExam(req: Request, res: Response) {
    const userId = req.user.id;
    const response = await this._examService.participateExam(userId);
    return res.status(response.status).json(response);
  }
  async continueExam(req: Request, res: Response) {
    const userId = req.user.id;
    const response = await this._examService.continueExam(userId);
    return res.status(response.status).json(response);
  }
  async submitSkill(req: Request, res: Response) {
    const userId = req.user.id;
    const response = await this._examService.submitSkill(userId, req.body);
    return res.status(response.status).json(response);
  }
}
