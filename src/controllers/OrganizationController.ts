import IOrganizationService from "@/interfaces/organization/IOrganizationService";
import OrganizationService from "@/services/organization/OrganizationService";
import { Request, Response } from "express";

export class OrganizationController {
  private _organizationService: IOrganizationService;
  constructor() {
    this._organizationService = new OrganizationService();
  }

  async getListOrganizations(req: Request, res: Response) {
    const response = await this._organizationService.getAllOrganization();
    return res.status(response.status).json(response);
  }

  async getOrganizationById(req: Request, res: Response) {
    const organizationId = req.params.id;
    const response = await this._organizationService.getOrganizationById(organizationId);
    return res.status(response.status).json(response);
  }

  async createOrganization(req: Request, res: Response) {
    const data = req.body;
    const response = await this._organizationService.createOrganization(data);
    return res.status(response.status).json(response);
  }

  async updateOrganization(req: Request, res: Response) {
    const organizationId = req.params.id;
    const data = req.body;
    const response = await this._organizationService.updateOrganization(organizationId, data);
    return res.status(response.status).json(response);
  }

  async deleteOrganization(req: Request, res: Response) {
    const organizationId = req.params.id;
    const response = await this._organizationService.deleteOrganization(organizationId);
    return res.status(response.status).json(response);
  }
}
