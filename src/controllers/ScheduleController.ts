import { IScheduleService } from "@/interfaces/schedule/IScheduleService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import { ScheduleService } from "@/services/schedule/ScheduleService";
import { before, DELETE, GET, inject, POST, PUT, route } from "awilix-express";
import { Request, Response } from "express";


@before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
@route("/schedules")
export class ScheduleController {
  private _scheduleService: IScheduleService;

  constructor(ScheduleService: ScheduleService) {
    this._scheduleService = ScheduleService;
  }

  @GET()
  @route("/get-schedules")
  async getAllSchedule(req: Request, res: Response) {
    const response = await this._scheduleService.getAllSchedule();
    return res.status(response.status).json(response);
  }

  @GET()
  @route("/get-schedule/:id")
  async getScheduleById(req: Request, res: Response) {
    const scheduleId = req.params.id;
    const response = await this._scheduleService.getScheduleById(scheduleId);
    return res.status(response.status).json(response);
  }

  @POST()
  @route("/create-schedule")
  async createSchedule(req: Request, res: Response) {
    const data = req.body;
    const response = await this._scheduleService.createSchedule(data);
    return res.status(response.status).json(response);
  }

  @PUT()
  @route("/update-schedule/:id")
  async updateSchedule(req: Request, res: Response) {
    const scheduleId = req.params.id;
    const data = req.body;
    const response = await this._scheduleService.updateSchedule(scheduleId, data);
    return res.status(response.status).json(response);
  }

  @DELETE()
  @route("/delete-schedule/:id")
  async deleteSchedule(req: Request, res: Response) {
    const scheduleId = req.params.id;
    const response = await this._scheduleService.deleteSchedule(scheduleId);
    return res.status(response.status).json(response);
  }
}
