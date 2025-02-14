import {
  IAddNewPlanAttributeDTO,
  ICreateNewPlanTypeDTO,
  IUpdatePlanAttributeDTO,
  IUpdatePlanTypeDTO,
} from "@/interfaces/plan/IPlanDTO";
import IPlanService from "@/interfaces/plan/IPlanService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import PlanService from "@/services/plan/PlanService";
import { before, DELETE, GET, inject, POST, PUT, route } from "awilix-express";
import { Request, Response } from "express";

@before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
@route("/plans")
export class PlanController {
  private _planService: IPlanService;

  constructor(PlanService: PlanService) {
    this._planService = PlanService;
  }
  @GET()
  @route("/get-plan-types")
  async getPlanTypes(req: Request, res: Response) {
    const introduction = await this._planService.getAllPlanTypes();
    return res.status(introduction.status).json(introduction);
  }

  @GET()
  @route("/get-general-attributes")
  async getGeneralPlanAttributes(req: Request, res: Response) {
    const introduction = await this._planService.getGeneralPlanAttributes();
    return res.status(introduction.status).json(introduction);
  }

  @POST()
  @route("/create-plan-attributes")
  async createPlanAttributes(req: Request, res: Response) {
    const data = req.body as IAddNewPlanAttributeDTO;
    const response = await this._planService.createPlanAttributes(data);
    return res.status(response.status).json(response);
  }

  @POST()
  @route("/create-plan-type")
  async createPlanType(req: Request, res: Response) {
    const data = req.body as ICreateNewPlanTypeDTO;
    const response = await this._planService.createNewPlanType(data);
    return res.status(response.status).json(response);
  }

  @PUT()
  @route("/update-plan-attribute")
  async updatePlanAttribute(req: Request, res: Response) {
    const data = req.body as IUpdatePlanAttributeDTO;
    const response = await this._planService.updatePlanAttribute(data);
    return res.status(response.status).json(response);
  }

  @DELETE()
  @route("/delete-plan-attribute/:id")
  async deletePlanAttribute(req: Request, res: Response) {
    const { id } = req.params;
    const response = await this._planService.deletePlanAttribute(id);
    return res.status(response.status).json(response);
  }

  @PUT()
  @route("/update-plan-type")
  async updatePlanType(req: Request, res: Response) {
    const data = req.body as IUpdatePlanTypeDTO;
    const response = await this._planService.updatePlanType(data);
    return res.status(response.status).json(response);
  }

  @DELETE()
  @route("/delete-plan-type/:id")
  async deletePlanType(req: Request, res: Response) {
    const { id } = req.params;
    const response = await this._planService.deletePlanType(id);
    return res.status(response.status).json(response);
  }
}
