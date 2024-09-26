import IUserService from "@/interfaces/user/IUserService";
import UserService from "@/services/user/UserServices";
import { Request, Response } from "express";

export class UserController {
  private _userService: IUserService;

  constructor() {
    this._userService = new UserService();
  }

  async getAllUser(req: Request, res: Response) {
    const { page = 1, limit = 10, search } = req.query;
    const users = await this._userService.getAllUser(+page, +limit, search as string);
    return res.status(users.status).json(users);
  }

  async getDeletedUsers(req: Request, res: Response) {
    const { page, limit, search } = req.query;
    const users = await this._userService.getDeletedUsers(+page, +limit, search as string);
    return res.status(users.status).json(users);
  }

  async getUserById(req: Request, res: Response) {
    const { userId } = req.params;
    const user = await this._userService.getUserById(userId);
    return res.status(user.status).json(user);
  }

  async createUser(req: Request, res: Response) {
    const data = req.body;
    const user = await this._userService.createUser(data);
    return res.status(user.status).json(user);
  }

  async updateUser(req: Request, res: Response) {
    const { userId } = req.params;
    const data = req.body;
    const user = await this._userService.updateUser(userId, data);
    return res.status(user.status).json(user);
  }

  async deleteUser(req: Request, res: Response) {
    const { userId } = req.params;
    const user = await this._userService.deleteUser(userId);
    return res.status(user.status).json(user);
  }
  async restoreUser(req: Request, res: Response) {
    const { userId } = req.params;
    const user = await this._userService.restoreUser(userId);
    return res.status(user.status).json(user);
  }
  async deletePermanentlyUser(req: Request, res: Response) {
    const { userId } = req.params;
    const user = await this._userService.deletePermanentlyUser(userId);
    return res.status(user.status).json(user);
  }
}
