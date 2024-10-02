import { Response } from "express";
import { BaseRoute } from "./BaseRoute";
import { Request as ExpressRequest } from "express";
import { LevelController } from "@/controllers/LevelController";

class LevelRoutes extends BaseRoute {
  private _levelController: LevelController;
  constructor() {
    super();
    this.init();
    this._levelController = new LevelController();
  }

  init() {
    this.router.get("/get-levels", (req: ExpressRequest, res: Response) => {
      this._levelController.getAllLevels(req, res);
    });
    this.router.get("/get-level/:levelId", (req: ExpressRequest, res: Response) => {
      this._levelController.getLevelById(req, res);
    });
    this.router.get("/get-level-of-skill/:skillId", (req: ExpressRequest, res: Response) => {
      this._levelController.getLevelOfSkillId(req, res);
    });
    this.router.put("/update-level/:levelId", (req: ExpressRequest, res: Response) => {
      this._levelController.updateLevel(req, res);
    });
  }
}

export = new LevelRoutes().router;
