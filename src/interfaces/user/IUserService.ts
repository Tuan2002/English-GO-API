import { IResponseBase } from "../base/IResponseBase";
import { ICreateUserData, IUpdateUserData } from "./UserDTO";

export default interface IUserService {
  getUserByEmail(email: string): Promise<IResponseBase>;
  getAllUser(page: number, limit: number, search: string): Promise<IResponseBase>;
  getDeletedUsers(page: number, limit: number, search: string): Promise<IResponseBase>;
  getUserById(userId: string): Promise<IResponseBase>;
  createUser(data: ICreateUserData): Promise<IResponseBase>;
  updateUser(userId: string, data: IUpdateUserData): Promise<IResponseBase>;
  deleteUser(userId: string): Promise<IResponseBase>;
  deletePermanentlyUser(userId: string): Promise<IResponseBase>;
  restoreUser(userId: string): Promise<IResponseBase>;
}
