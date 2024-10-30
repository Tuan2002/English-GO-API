import { Response } from "express";
import { BaseRoute } from "./BaseRoute";
import { Request as ExpressRequest } from "express";
import { OrganizationController } from "@/controllers/OrganizationController";

class OrganizationRoutes extends BaseRoute {
  private _organizationController: OrganizationController;
  constructor() {
    super();
    this.init();
    this._organizationController = new OrganizationController();
  }

  init() {
    this.router.get("/get-organizations", (req: ExpressRequest, res: Response) => {
      this._organizationController.getListOrganizations(req, res);
    });
    this.router.get("/get-organization/:id", (req: ExpressRequest, res: Response) => {
      this._organizationController.getOrganizationById(req, res);
    });
    this.router.post("/create-organization", (req: ExpressRequest, res: Response) => {
      this._organizationController.createOrganization(req, res);
    });
    this.router.put("/update-organization/:id", (req: ExpressRequest, res: Response) => {
      this._organizationController.updateOrganization(req, res);
    });
    this.router.delete("/delete-organization/:id", (req: ExpressRequest, res: Response) => {
      this._organizationController.deleteOrganization(req, res);
    });
  }
}

export = new OrganizationRoutes().router;
