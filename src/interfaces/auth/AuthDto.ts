import { EGenderStatus } from "../user/UserDTO";
import { IAccessTokenResponse } from "./IJWTService";

export interface IUserLoginData {
  email: string;
  password: string;
  isRememberMe: boolean;
}

export interface IUserRegisterData {
  email: string;
  password: string;
  fullName: string;
  role: "3" | "4";
}

export interface IUserLoginResponse {
  accessToken: IAccessTokenResponse;
  userInfo: {
    userId: string;
    email: string;
    fullName: string;
    role: {
      roleName: string;
      displayName: string;
    };
  };
  permissions: IFunctionByRole[];
}

export interface IUserRegisterResponse {
  email: string;
  fullName: string;
}

export interface IFunctionByRole {
  id: string;
  name: string;
  displayName: string;
  functionLink: string;
}

export interface IUpdateProfilePayload {
  id: string;
  avatar: string;
  banner: string;
  fullName: string;
  birthday: string;
  gerder: EGenderStatus;
  phoneNumber: string;
}
