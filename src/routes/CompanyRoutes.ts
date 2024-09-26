import { Response } from "express";
import { Request as ExpressRequest } from "express";
import { BaseRoute } from "./BaseRoute";
import { CompanyController } from "@/controllers/CompanyController";

class CompanyRoutes extends BaseRoute {
  private _companyController: CompanyController;

  constructor() {
    super();
    this._companyController = new CompanyController();
    this.init();
  }

  private init() {
    this.router.post("/register-company-by-recruiter", (req: ExpressRequest, res: Response) => {
      this._companyController.registerCompanyByRecruitment(req, res);
    });
    this.router.get("/list-company", (req: ExpressRequest, res: Response) => {
      this._companyController.getListCompany(req, res);
    });
    this.router.get("/company/:id", (req: ExpressRequest, res: Response) => {
      this._companyController.getCompanyById(req, res);
    });
    this.router.get("/my-company", (req: ExpressRequest, res: Response) => {
      this._companyController.getMyCompany(req, res);
    });
    this.router.put("/update-company-when-register", (req: ExpressRequest, res: Response) => {
      this._companyController.updateCompanyWhenRegister(req, res);
    });
    this.router.put("/approve-register-company/:id", (req: ExpressRequest, res: Response) => {
      this._companyController.approveRegisterCompany(req, res);
    });
    this.router.put("/reject-register-company/:id", (req: ExpressRequest, res: Response) => {
      this._companyController.rejectRegisterCompany(req, res);
    });
  }
}

export = new CompanyRoutes().router;
