export interface IAccessTokenPayload {
  userId: string;
  email: string;
  role: string;
  roleName: string;
  isRecruiter: boolean;
}
export interface IAccessTokenResponse {
  token: string;
  expiresAt: Date;
  expiresAtUtc: string;
}
export interface IJWTService {
  generateAccessToken(payload: IAccessTokenPayload): IAccessTokenResponse;
  verifyAccessToken(token: string): boolean;
  getTokenPayload(token: string): any;
}
