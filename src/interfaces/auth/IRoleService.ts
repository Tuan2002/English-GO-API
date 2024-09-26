import { IResponseBase } from "../base/IResponseBase";

export default interface IRoleService {
  getUserRoles(roleId: string): Promise<IResponseBase>;
  getCurrentUserPermission(roleId: string): Promise<IResponseBase>;
  getGroupRole(groupRoleId: string): Promise<IResponseBase>;
  getAllGroupRoles(): Promise<IResponseBase>;
}
