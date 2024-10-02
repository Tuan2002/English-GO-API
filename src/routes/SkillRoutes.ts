import { Response } from "express";
import { BaseRoute } from "./BaseRoute";
import { Request as ExpressRequest } from "express";
import { SkillController } from "@/controllers/SkillController";

class SkillRoutes extends BaseRoute {
  private _skillController: SkillController;
  constructor() {
    super();
    this.init();
    this._skillController = new SkillController();
  }

  init() {
    this.router.get("/get-skills", (req: ExpressRequest, res: Response) => {
      this._skillController.getAllSkills(req, res);
    });
    this.router.get("/get-skill/:skillId", (req: ExpressRequest, res: Response) => {
      this._skillController.getSkillById(req, res);
    });
    this.router.put("/update-skill/:skillId", (req: ExpressRequest, res: Response) => {
      this._skillController.updateSkill(req, res);
    });
  }
}

export = new SkillRoutes().router;
