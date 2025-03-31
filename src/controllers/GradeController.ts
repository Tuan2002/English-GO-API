import IGradeService from "@/interfaces/grade/IGradeService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import GradeService from "@/services/grade/GradeService";
import { before, inject, POST, route } from "awilix-express";
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
}
