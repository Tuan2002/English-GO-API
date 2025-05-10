import { IUpdateExaminerIntroductionDTO } from "@/interfaces/examinerIntroduction/IExaminerIntroductionDTO";
import IExaminerIntroductionService from "@/interfaces/examinerIntroduction/IExaminerIntroductionService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import ExaminerIntroductionService from "@/services/examinerIntroduction/ExaminerIntroductionService";
import { before, GET, inject, PUT, route } from "awilix-express";
import { Request, Response } from "express";

@before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
@route("/examiner-introductions")
export class ExaminerIntroductionController {
  private _examinerIntroduction: IExaminerIntroductionService;

  constructor(ExaminerIntroductionService: ExaminerIntroductionService) {
    this._examinerIntroduction = ExaminerIntroductionService;
  }
  @GET()
  @route("/get-my-introduction")
  async getMyIntroduction(req: Request, res: Response) {
    const introduction = await this._examinerIntroduction.getExaminerIntroduction();
    return res.status(introduction.status).json(introduction);
  }

  @GET()
  @route("/get-all-examiners")
  async getAllExaminers(req: Request, res: Response) {
    const introduction = await this._examinerIntroduction.getAllExaminerIntroduction();
    return res.status(introduction.status).json(introduction);
  }

  @PUT()
  @route("/update-my-introduction")
  async updateMyIntroduction(req: Request, res: Response) {
    const data = req.body as IUpdateExaminerIntroductionDTO;
    const response = await this._examinerIntroduction.updateExaminerIntroduction(data);
    return res.status(response.status).json(response);
  }
}
