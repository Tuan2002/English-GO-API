import { ISetupService } from "@/interfaces/setup/ISetupService";
import { SetupService } from "@/services/setup/SetupService";
import { POST, route } from "awilix-express";
import { Request, Response } from "express";


@route("/setup")
export class SetupController {
  private _setupService: ISetupService;

  constructor(SetupService: SetupService) {
    this._setupService = SetupService;
  }
  @POST()
  @route("/init-data")
  async setupService(req: Request, res: Response) {
    const setup = await this._setupService.setupService();
    return res.status(setup.status).json(setup);
  }
}
