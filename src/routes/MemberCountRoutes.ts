import { Response } from "express";
import { Request as ExpressRequest } from "express";
import { BaseRoute } from "./BaseRoute";
import { MemberCountController } from "@/controllers/MemberCountController";

class MemberCountRoutes extends BaseRoute {
  private _provinceController: MemberCountController;

  constructor() {
    super();
    this._provinceController = new MemberCountController();
    this.init();
  }

  private init() {
    this.router.get("/get-member-counts", (req: ExpressRequest, res: Response) => {
      this._provinceController.getAllMemberCounts(req, res);
    });
  }
}

export = new MemberCountRoutes().router;
