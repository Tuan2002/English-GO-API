import { IResponseBase } from "../base/IResponseBase";

export default interface IOrganizationService {
  getAllOrganization(): Promise<IResponseBase>;
  getOrganizationById(organizationId: any): Promise<IResponseBase>;
  createOrganization(data: any): Promise<IResponseBase>;
  updateOrganization(organizationId: any, data: any): Promise<IResponseBase>;
  deleteOrganization(organizationId: any): Promise<IResponseBase>;
}
