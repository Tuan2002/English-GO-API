import IUserService from "@/interfaces/user/IUserService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import UserService from "@/services/user/UserServices";
import { before, DELETE, GET, inject, POST, PUT, route } from "awilix-express";
import { Request, Response } from "express";


@before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
@route("/users")
export class UserController {
  private _userService: IUserService;

  constructor(UserService: UserService) {
    this._userService = UserService;
  }

  @GET()
  @route("/get-users")
  async getAllUser(req: Request, res: Response) {
    const { page = 1, limit = 10, search } = req.query;
    const users = await this._userService.getAllUser(+page, +limit, search as string);
    return res.status(users.status).json(users);
  }

  @GET()
  @route("/get-deleted-users")
  async getDeletedUsers(req: Request, res: Response) {
    const { page, limit, search } = req.query;
    const users = await this._userService.getDeletedUsers(+page, +limit, search as string);
    return res.status(users.status).json(users);
  }

  @GET()
  @route("/get-user/:userId")
  async getUserById(req: Request, res: Response) {
    const { userId } = req.params;
    const user = await this._userService.getUserById(userId);
    return res.status(user.status).json(user);
  }

  @POST()
  @route("/create-user")
  async createUser(req: Request, res: Response) {
    const data = req.body;
    const user = await this._userService.createUser(data);
    return res.status(user.status).json(user);
  }

  @PUT()
  @route("/update-user/:userId")
  async updateUser(req: Request, res: Response) {
    const { userId } = req.params;
    const data = req.body;
    const user = await this._userService.updateUser(userId, data);
    return res.status(user.status).json(user);
  }

  @DELETE()
  @route("/delete-user/:userId")
  async deleteUser(req: Request, res: Response) {
    const { userId } = req.params;
    const user = await this._userService.deleteUser(userId);
    return res.status(user.status).json(user);
  }

  @PUT()
  @route("/restore-user/:userId")
  async restoreUser(req: Request, res: Response) {
    const { userId } = req.params;
    const user = await this._userService.restoreUser(userId);
    return res.status(user.status).json(user);
  }

  @DELETE()
  @route("/delete-user-permanently/:userId")
  async deletePermanentlyUser(req: Request, res: Response) {
    const { userId } = req.params;
    const user = await this._userService.deletePermanentlyUser(userId);
    return res.status(user.status).json(user);
  }
}
