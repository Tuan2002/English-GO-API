import { IUserLoginData, IUserRegisterData } from "@/interfaces/auth/AuthDto";
import IAuthService from "@/interfaces/auth/IAuthService";
import IRoleService from "@/interfaces/auth/IRoleService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import { before, GET, inject, POST, route } from "awilix-express";
import { Request, Response } from "express";

@route("/auth")
export class AuthController {

  private readonly _authService: IAuthService;
  private readonly _roleService: IRoleService;

  constructor(AuthService: IAuthService, RoleService: IRoleService) {
    this._authService = AuthService;
    this._roleService = RoleService;
  }
  @POST()
  @route("/login")
  async login(req: Request, res: Response) {
    const loginData: IUserLoginData = req.body;
    const setAccessTokenToCookie = (data: string) => {
      res.cookie("accessToken", data, {
        secure: true,
        sameSite: "none",
      });
    };

    const response = await this._authService.login(loginData, setAccessTokenToCookie);
    res.status(response.status).json(response);
  }
  @before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
  @GET()
  @route("/check-user")
  async checkUserSSO(req: Request, res: Response) {
    const response = await this._authService.checkUserExist();
    res.status(response.status).json(response);
  }
  @POST()
  @route("/register")
  async register(req: Request, res: Response) {
    const registerData: IUserRegisterData = req.body;
    const response = await this._authService.register(registerData);
    res.status(response.status).json(response);
  }
  @before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
  @POST()
  @route("/register-user-sso")
  async registerUserSSO(req: Request, res: Response) {
    const response = await this._authService.registerUserSSO();
    res.status(response.status).json(response);
  }

  @before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
  @GET()
  @route("/get-me")
  async getMe(req: Request, res: Response) {
    const response = await this._authService.getMe();
    res.status(response.status).json(response);
  }

  @GET()
  @route("/get-group-roles")
  async getAllGroupRoles(req: Request, res: Response) {
    const response = await this._roleService.getAllGroupRoles();
    res.status(response.status).json(response);
  }

  @before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
  @POST()
  @route("/update-my-profile")
  async updateMyProfile(req: Request, res: Response) {
    const userId = req.user.id;
    const payload = req.body;
    const response = await this._authService.updateMyProfile(userId, payload);
    res.status(response.status).json(response);
  }
}
