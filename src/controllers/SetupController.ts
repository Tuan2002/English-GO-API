import { ISetupService } from "@/interfaces/setup/ISetupService";
import { SetupService } from "@/services/setup/SetupService";
import { Request, Response } from "express";

export class SetupController {
  private _setupService: ISetupService;
  constructor() {
    this._setupService = new SetupService();
  }

  async setupService(req: Request, res: Response) {
    const setup = await this._setupService.setupService();
    return res.status(setup.status).json(setup);
  }
}
