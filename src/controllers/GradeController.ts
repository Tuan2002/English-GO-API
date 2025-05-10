import IGradeService from "@/interfaces/grade/IGradeService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import GradeService from "@/services/grade/GradeService";
import { before, GET, inject, POST, route } from "awilix-express";
import { Request, Response } from "express";

@before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
@route("/grades")
export class GradeController {
  private _gradeService: IGradeService;

  constructor(GradeService: GradeService) {
    this._gradeService = GradeService;
  }
  @POST()
  @route("/grade-writing-with-ai")
  async getAllLevels(req: Request, res: Response) {
    const { examId, levelId } = req.body;
    const response = await this._gradeService.gradeWritingWithAI({
      examId,
      levelId,
    });
    return res.status(response.status).json(response);
  }

  @POST()
  @route("/grade-speaking-with-ai")
  async getLevelById(req: Request, res: Response) {
    const { examId, levelId } = req.body;
    const response = await this._gradeService.gradeSpeakingWithAI({
      examId,
      levelId,
    });
    return res.status(response.status).json(response);
  }

  @GET()
  @route("/grading-feedback-with-ai/:examId")
  async getGradingFeedbackWithAI(req: Request, res: Response) {
    const { examId } = req.params;
    const { skill } = req.query;
    console.log("examId", examId);
    console.log("skill", skill);
    const response = await this._gradeService.getGradingFeedbackWithAI(examId as string, skill as string);
    return res.status(response.status).json(response);
  }

  @GET()
  @route("/grading-feedback-with-examiner/:regsiterGradeExamId")
  async getGradingFeedbackWithPerson(req: Request, res: Response) {
    const { regsiterGradeExamId } = req.params;
    const response = await this._gradeService.getGradingFeedbackWithPerson(regsiterGradeExamId as string);
    return res.status(response.status).json(response);
  }

  @POST()
  @route("/register-grading-exam-with-person")
  async registerGradingExamWithPerson(req: Request, res: Response) {
    const data = req.body;
    const response = await this._gradeService.registerGradingExamWithPerson(data);
    return res.status(response.status).json(response);
  }

  @POST()
  @route("/check-registered-with-person")
  async checkRegisteredWithPerson(req: Request, res: Response) {
    const data = req.body;
    const response = await this._gradeService.checkRegisterGradingExamWithPerson(data);
    return res.status(response.status).json(response);
  }

  @GET()
  @route("/get-list-registered-grade-exam-by-examiner/:examinerId")
  async getListRegisteredGradeExamByExaminer(req: Request, res: Response) {
    const { examinerId } = req.params;
    const response = await this._gradeService.getListRegisteredGradeExamByExaminer(examinerId as string);
    return res.status(response.status).json(response);
  }

  @POST()
  @route("/grade-question-with-person")
  async gradeQuestionWithPerson(req: Request, res: Response) {
    const data = req.body;
    const response = await this._gradeService.gradeQuestionWithPerson(data);
    return res.status(response.status).json(response);
  }
}
