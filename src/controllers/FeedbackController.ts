import { IPaginationBase } from "@/interfaces/base/IPaginationBase";
import { ISendFeedbackDTO } from "@/interfaces/feedback/IFeedbackDTO";
import IFeedbackService from "@/interfaces/feedback/IFeedbackService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import FeedbackService from "@/services/feedback/FeedbackService";
import { before, GET, inject, POST, route } from "awilix-express";
import { Request, Response } from "express";

@route("/feedbacks")
export class FeedbackController {
  private _feedbackService: IFeedbackService;

  constructor(FeedbackService: FeedbackService) {
    this._feedbackService = FeedbackService;
  }
  @GET()
  @route("/get-feedbacks")
  async getAllFeedbacks(req: Request, res: Response) {
    const { page, limit } = req.query;
    const paginationData: IPaginationBase = {
      page: Number(page ?? "1"),
      limit: Number(limit ?? "10"),
    };
    const levels = await this._feedbackService.getAllFeedback(paginationData);
    return res.status(levels.status).json(levels);
  }

  @POST()
  @before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
  @route("/send-feedback")
  async sendFeedback(req: Request, res: Response) {
    const data = req.body as ISendFeedbackDTO;
    const response = await this._feedbackService.sendFeedback(data);
    return res.status(response.status).json(response);
  }
}
