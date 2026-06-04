import * as jwt from "jsonwebtoken";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoginRequest } from "./dto/login.request";
import { LoginResponse } from "./dto/login.response";
import { AuthTokenType } from "./enum/auth-token-type.enum";
import { InvalidCredentialsException } from "./exception/invalid-credentials.exception";
import { InvalidTokenException } from "./exception/invalid-token.exception";
import { MemberRepository } from "../member/member.repository";
import { RefreshTokenRepository } from "./refresh-token.repository";
import { JwtPayload } from "./type/jwt-payload.type";

@Injectable()
export class AuthService {
  private readonly jwtSecretKey: string;

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly configService: ConfigService
  ) {
    this.jwtSecretKey = this.configService.getOrThrow<string>("jwt.secretKey");
  }

  login(loginRequest: LoginRequest): LoginResponse {
    const member = this.memberRepository.findByLoginId(loginRequest.loginId);

    if (!member) {
      throw new InvalidCredentialsException();
    }

    return {
      accessToken: this.generateAccessToken({
        userId: member.id,
        loginId: member.loginId,
        roleType: member.roleType
      }),
      member: {
        id: member.id,
        loginId: member.loginId,
        name: member.name,
        roleType: member.roleType
      }
    };
  }

  generateToken(expiresIn: string | number, payload: object = {}): string {
    return jwt.sign(payload, this.jwtSecretKey, {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"]
    });
  }

  verifyToken(token: string): string | jwt.JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecretKey);
    } catch {
      throw new InvalidTokenException();
    }
  }

  generateAccessToken(payload: Omit<JwtPayload, "tokenType">): string {
    return this.generateToken(this.configService.getOrThrow<string>("jwt.accessExpiresIn"), {
      ...payload,
      tokenType: AuthTokenType.ACCESS
    });
  }

  generateRefreshToken(payload: Omit<JwtPayload, "tokenType">): string {
    return this.generateToken(this.configService.getOrThrow<string>("jwt.refreshExpiresIn"), {
      ...payload,
      tokenType: AuthTokenType.REFRESH
    });
  }
}
