import { IScheduleService } from "@/interfaces/schedule/IScheduleService";
import { ScheduleService } from "@/services/schedule/ScheduleService";
import { Request, Response } from "express";

export class ScheduleController {
  private _scheduleService: IScheduleService;
  constructor() {
    this._scheduleService = new ScheduleService();
  }

  async getAllSchedule(req: Request, res: Response) {
    const response = await this._scheduleService.getAllSchedule();
    return res.status(response.status).json(response);
  }

  async getScheduleById(req: Request, res: Response) {
    const scheduleId = req.params.id;
    const response = await this._scheduleService.getScheduleById(scheduleId);
    return res.status(response.status).json(response);
  }

  async createSchedule(req: Request, res: Response) {
    const data = req.body;
    const response = await this._scheduleService.createSchedule(data);
    return res.status(response.status).json(response);
  }

  async updateSchedule(req: Request, res: Response) {
    const scheduleId = req.params.id;
    const data = req.body;
    const response = await this._scheduleService.updateSchedule(scheduleId, data);
    return res.status(response.status).json(response);
  }

  async deleteSchedule(req: Request, res: Response) {
    const scheduleId = req.params.id;
    const response = await this._scheduleService.deleteSchedule(scheduleId);
    return res.status(response.status).json(response);
  }
}
