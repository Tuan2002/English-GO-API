import IExamService from "@/interfaces/exam/IExamService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import { before, GET, inject, POST, route } from "awilix-express";
import { Request, Response } from "express";


@before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
@route("/exams")
export class ExamController {
  private _examService: IExamService;
  constructor(ExamService: IExamService) {
    // Constructor
    this._examService = ExamService;
  }

  @GET()
  @route("/current-exam")
  async getCurrentExam(req: Request, res: Response) {
    const userId = req.user.id;
    const response = await this._examService.getCurrentExam(userId);
    return res.status(response.status).json(response);
  }

  @POST()
  @route("/start-new-exam")
  async startNewExam(req: Request, res: Response) {
    const userId = req.user.id;
    const response = await this._examService.startNewExam(userId);
    return res.status(response.status).json(response);
  }

  @POST()
  @route("/participate-exam")
  async participateExam(req: Request, res: Response) {
    const userId = req.user.id;
    const response = await this._examService.participateExam(userId);
    return res.status(response.status).json(response);
  }

  @POST()
  @route("/continue-exam")
  async continueExam(req: Request, res: Response) {
    const userId = req.user.id;
    const response = await this._examService.continueExam(userId);
    return res.status(response.status).json(response);
  }

  @POST()
  @route("/submit-skill")
  async submitSkill(req: Request, res: Response) {
    const userId = req.user.id;
    const response = await this._examService.submitSkill(userId, req.body);
    return res.status(response.status).json(response);
  }

  @POST()
  @route("/submit-speaking-skill")
  async submitSpeakingSkill(req: Request, res: Response) {
    const userId = req.user.id;
    const response = await this._examService.submitSpeakingSkill(userId, req.body);
    return res.status(response.status).json(response);
  }

  @GET()
  @route("/current-speaking-question")
  async getCurrentSpeakingQuestion(req: Request, res: Response) {
    const userId = req.user.id;
    const response = await this._examService.getCurrentSpeakingQuestion(userId);
    return res.status(response.status).json(response);
  }

  @GET()
  @route("/get-score/:examId")
  async getScoreOfExam(req: Request, res: Response) {
    const examId = req.params.examId;
    const response = await this._examService.getScoreOfExam(examId);
    return res.status(response.status).json(response);
  }

  @GET()
  @route("/get-result/:examId")
  async getResultOfExam(req: Request, res: Response) {
    const examId = req.params.examId;
    const skillId = req.query.skillId as string;
    const response = await this._examService.getResultOfExam(examId, skillId);
    return res.status(response.status).json(response);
  }

  @GET()
  @route("/my-exams")
  async getMyExams(req: Request, res: Response) {
    const response = await this._examService.getMyExams();
    return res.status(response.status).json(response);
  }
}
