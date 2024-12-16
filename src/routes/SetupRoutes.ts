import { SetupController } from "@/controllers/SetupController";
import { BaseRoute } from "./BaseRoute";
import { Response, Request as ExpressRequest } from "express";

class SetupRoute extends BaseRoute {
  private _setupController: SetupController;
  constructor() {
    super();
    this._setupController = new SetupController();
    this.init();
  }
  init() {
    this.router.post("/init-data", (req: ExpressRequest, res: Response) => {
      this._setupController.setupService(req, res);
    });
  }
}

export = new SetupRoute().router;
