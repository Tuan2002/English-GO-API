import { Response } from "express";
import { Request as ExpressRequest } from "express";
import { BaseRoute } from "./BaseRoute";
import { ProvinceController } from "@/controllers/ProvinceController";

class ProvinceRoutes extends BaseRoute {
  private _provinceController: ProvinceController;

  constructor() {
    super();
    this._provinceController = new ProvinceController();
    this.init();
  }

  private init() {
    this.router.get("/get-provincies", (req: ExpressRequest, res: Response) => {
      this._provinceController.getProvincies(req, res);
    });
  }
}

export = new ProvinceRoutes().router;
