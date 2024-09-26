import ICompanyService from "@/interfaces/company/ICompanyService";
import { CompanyService } from "@/services/company/CompanyService";
import { Request, Response } from "express";

export class CompanyController {
  private _companyService: ICompanyService;
  constructor() {
    this._companyService = new CompanyService();
  }

  public async getListCompany(req: Request, res: Response) {
    const { page = 1, limit = 10, search } = req.query;
    const companies = await this._companyService.getAllCompany(+page, +limit, search as string);
    return res.status(companies.status).json(companies);
  }
  public async getCompanyById(req: Request, res: Response) {
    const { id } = req.params;
    const company = await this._companyService.getCompanyById(id);
    return res.status(company.status).json(company);
  }

  public async registerCompanyByRecruitment(req: Request, res: Response) {
    const userId = req.user.id;
    req.body.userId = userId;
    const response = await this._companyService.registerCompanyByRecruitment(req.body);
    return res.status(response.status).json(response);
  }

  public async getMyCompany(req: Request, res: Response) {
    const userId = req.user.id;
    const response = await this._companyService.getCompanyByUserId(userId);
    return res.status(response.status).json(response);
  }
  public async updateCompanyWhenRegister(req: Request, res: Response) {
    const response = await this._companyService.updateCompanyWhenRegister(req.body);
    return res.status(response.status).json(response);
  }
  public async approveRegisterCompany(req: Request, res: Response) {
    const { id } = req.params;
    const response = await this._companyService.approveRegisterCompany(id);
    return res.status(response.status).json(response);
  }
  public async rejectRegisterCompany(req: Request, res: Response) {
    const { id } = req.params;
    const { reason } = req.body;

    const response = await this._companyService.rejectRegisterCompany(id, reason);
    return res.status(response.status).json(response);
  }
}
