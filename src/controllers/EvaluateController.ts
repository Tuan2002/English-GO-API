import { IPaginationBase } from "@/interfaces/base/IPaginationBase";
import { ISendEvaluateDTO } from "@/interfaces/evaluate/IEvaluateDTO";
import IEvaluateService from "@/interfaces/evaluate/IEvaluateService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import EvaluateService from "@/services/evaluate/EvaluateService";
import { before, GET, inject, POST, PUT, route } from "awilix-express";
import { Request, Response } from "express";

@before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
@route("/evaluates")
export class EvaluateController {
  private _evaluateService: IEvaluateService;

  constructor(EvaluateService: EvaluateService) {
    this._evaluateService = EvaluateService;
  }
  @GET()
  @route("/get-evaluates")
  async getAllEvaluates(req: Request, res: Response) {
    const { page, limit, isShow } = req.query;
    console.log("page", page);
    console.log("limit", limit);
    console.log("isShow", isShow);
    const paginationData: IPaginationBase = {
      page: Number(page ?? "1"),
      limit: Number(limit ?? "10"),
      search: {
        isShow: isShow as string,
      },
    };

    const levels = await this._evaluateService.getEvaluates(paginationData);
    return res.status(levels.status).json(levels);
  }

  @POST()
  @route("/send-evaluate")
  async sendEvaluate(req: Request, res: Response) {
    const data = req.body as ISendEvaluateDTO;
    const response = await this._evaluateService.sendEvaluate(data);
    return res.status(response.status).json(response);
  }

  @PUT()
  @route("/toogle-show-evaluate/:id")
  async toogleShowEvaluate(req: Request, res: Response) {
    const { id } = req.params;
    const response = await this._evaluateService.toogleShowEvaluate(id);
    return res.status(response.status).json(response);
  }
}
