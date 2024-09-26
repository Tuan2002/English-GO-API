import { ENV } from "@/constants/env";
import { IJWTService } from "@/interfaces/auth/IJWTService";
import jwt from "jsonwebtoken";

export default class JwtService implements IJWTService {
  private accessTokenSecret!: string;
  private accessTokenExpriedIn!: number;
  constructor() {
    this.accessTokenSecret = String(ENV.ACCESS_TOKEN_SECRET);
    this.accessTokenExpriedIn = Number(ENV.ACCESS_TOKEN_EXPIRES_IN);
  }

  generateAccessToken(payload: any) {
    const token = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpriedIn,
    });
    const expiresAt = new Date(Date.now() + this.accessTokenExpriedIn * 1000);
    return {
      token,
      expiresAt,
      expiresAtUtc: expiresAt.toUTCString(),
    };
  }
  verifyAccessToken(token: string): boolean {
    try {
      jwt.verify(token, this.accessTokenSecret);
      return true;
    } catch {
      return false;
    }
  }
  getTokenPayload(token: string) {
    return jwt.decode(token);
  }
}
