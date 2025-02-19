import { IResponseBase } from "../base/IResponseBase";
import { IAddNewPlanAttributeDTO, ICreateNewPlanTypeDTO, IUpdatePlanAttributeDTO, IUpdatePlanTypeDTO } from "./IPlanDTO";

export default interface IPlanService {
  getAllPlanTypes(): Promise<IResponseBase>;
  getGeneralPlanAttributes(): Promise<IResponseBase>;
  createPlanAttributes(data: IAddNewPlanAttributeDTO): Promise<IResponseBase>;
  createNewPlanType(data: ICreateNewPlanTypeDTO): Promise<IResponseBase>;
  updatePlanAttribute(data: IUpdatePlanAttributeDTO): Promise<IResponseBase>;
  deletePlanAttribute(id: string): Promise<IResponseBase>;
  updatePlanType(data: IUpdatePlanTypeDTO): Promise<IResponseBase>;
  deletePlanType(id: string): Promise<IResponseBase>;
}
