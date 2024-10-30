import { ScheduleController } from "@/controllers/ScheduleController";
import { BaseRoute } from "./BaseRoute";
import { Response, Request as ExpressRequest } from "express";

class ScheduelRoutes extends BaseRoute {
  private _scheduleController: ScheduleController;
  constructor() {
    super();
    this._scheduleController = new ScheduleController();
    this.init();
  }
  init() {
    this.router.get("/get-schedules", (req: ExpressRequest, res: Response) => {
      this._scheduleController.getAllSchedule(req, res);
    });
    this.router.get("/get-schedule/:id", (req: ExpressRequest, res: Response) => {
      this._scheduleController.getScheduleById(req, res);
    });
    this.router.post("/create-schedule", (req: ExpressRequest, res: Response) => {
      this._scheduleController.createSchedule(req, res);
    });
    this.router.put("/update-schedule/:id", (req: ExpressRequest, res: Response) => {
      this._scheduleController.updateSchedule(req, res);
    });
    this.router.delete("/delete-schedule/:id", (req: ExpressRequest, res: Response) => {
      this._scheduleController.deleteSchedule(req, res);
    });
  }
}
