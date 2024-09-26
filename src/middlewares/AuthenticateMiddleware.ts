import { NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import "dotenv/config";
import { ErrorMessages } from "@/constants/ErrorMessages";
import JwtService from "@/services/auth/JWTService";
import { Request, Response } from "express";
import { ENV } from "@/constants/env";

export default class AuthenticationMiddleware {
  private _jwtService: JwtService;
  constructor() {
    this._jwtService = new JwtService();
  }
  public authenticate: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const nonSecurePaths = [
      "/",
      "/auth/login",
      "/auth/register",
      "/auth/get-group-roles",
      "/provinces/get-provincies",
      "/member-counts/get-member-counts",
    ];
    if (nonSecurePaths.includes(req.path)) return next();

    let accessToken = "";
    switch (ENV.AUTH_MODE) {
      case "COOKIE": {
        const cookies = req.cookies;
        if (!cookies || !cookies["accessToken"]) break;
        accessToken = cookies["accessToken"];
        break;
      }
      default: {
        const authorization = req.headers["authorization"];
        if (!authorization) break;
        accessToken = authorization.split(" ")[1];
        break;
      }
    }
    if (!accessToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        error: {
          message: "Unauthorized",
          errorDetail: "Unauthorized",
        },
        success: false,
        data: null,
        ErrorMessages: ErrorMessages.UNAUTHORIZED,
      });
    }
    // Decode the token to get the payload
    const payload: any = this._jwtService.getTokenPayload(accessToken);
    const isValid: boolean = this._jwtService.verifyAccessToken(accessToken);
    // If the token is not valid, return an 401 error code
    if (!isValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        error: {
          message: "Unauthorized",
          errorDetail: "Unauthorized",
        },
        success: false,
        data: null,
        ErrorMessages: ErrorMessages.UNAUTHORIZED,
      });
    }
    // Check if the user has the required roles
    // if (roles) {
    //   const userRoles = payload?.roles;
    //   const hasRole = roles.some((role) => userRoles.includes(role));
    //   if (!hasRole) {
    //     const error = new HttpException(StatusCodes.FORBIDDEN, ErrorMessages.FORBIDDEN);
    //     return res.status(StatusCodes.FORBIDDEN).json(error.getError());
    //   }
    // }
    // // Attach the user to the request object
    req.user = {
      id: payload?.userId,
      email: payload?.email,
      roleName: payload?.roleName,
      role: payload?.role,
    };
    next();
  };
}
