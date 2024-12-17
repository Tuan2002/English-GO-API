import IOrganizationService from "@/interfaces/organization/IOrganizationService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import OrganizationService from "@/services/organization/OrganizationService";
import { before, DELETE, GET, inject, POST, PUT, route } from "awilix-express";
import { Request, Response } from "express";


@before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
@route("/organizations")
export class OrganizationController {
  private _organizationService: IOrganizationService;
  
  constructor(OrganizationService: OrganizationService) {
    this._organizationService = OrganizationService;
  }

  @GET()
  @route("/get-organizations")
  async getListOrganizations(req: Request, res: Response) {
    const response = await this._organizationService.getAllOrganization();
    return res.status(response.status).json(response);
  }

  @GET()
  @route("/get-organization/:id")
  async getOrganizationById(req: Request, res: Response) {
    const organizationId = req.params.id;
    const response = await this._organizationService.getOrganizationById(organizationId);
    return res.status(response.status).json(response);
  }

  @POST()
  @route("/create-organization")
  async createOrganization(req: Request, res: Response) {
    const data = req.body;
    const response = await this._organizationService.createOrganization(data);
    return res.status(response.status).json(response);
  }

  @PUT()
  @route("/update-organization/:id")
  async updateOrganization(req: Request, res: Response) {
    const organizationId = req.params.id;
    const data = req.body;
    const response = await this._organizationService.updateOrganization(organizationId, data);
    return res.status(response.status).json(response);
  }
  
  @DELETE()
  @route("/delete-organization/:id")
  async deleteOrganization(req: Request, res: Response) {
    const organizationId = req.params.id;
    const response = await this._organizationService.deleteOrganization(organizationId);
    return res.status(response.status).json(response);
  }
}
