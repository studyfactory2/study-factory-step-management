import * as jwt from "jsonwebtoken";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import { AuthLoginRequest } from "./dto/auth-login.request";
import { AuthLoginResponse } from "./dto/auth-login.response";
import { AuthTokenType } from "./enum/auth-token-type.enum";
import { InvalidCredentialsException } from "./exception/invalid-credentials.exception";
import { InvalidTokenException } from "./exception/invalid-token.exception";
import { MemberRepository } from "../member/member.repository";
import { RefreshTokenRepository } from "./refresh-token.repository";
import { JwtPayload } from "./type/jwt-payload.type";
import { RefreshToken } from "./entity/refresh-token.entity";

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

  async login(loginRequest: AuthLoginRequest): Promise<AuthLoginResponse> {
    const passwordHash = this.createPasswordHash(loginRequest.password);
    const member = await this.memberRepository.findByNameAndPasswordHash(
      loginRequest.name,
      passwordHash
    );

    if (!member) {
      throw new InvalidCredentialsException();
    }

    const tokenPayload = {
      userId: member.id,
      name: member.displayName ?? member.name,
      roleType: member.roleType
    };
    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    await this.saveRefreshToken(member.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      member: {
        id: member.id,
        name: member.displayName ?? member.name,
        branch: member.branch,
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

  private async saveRefreshToken(memberId: number, token: string): Promise<void> {
    await this.refreshTokenRepository.deleteByMemberId(memberId);

    const refreshToken = new RefreshToken();
    refreshToken.memberId = memberId;
    refreshToken.token = token;

    await this.refreshTokenRepository.save(refreshToken);
  }

  private createPasswordHash(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }
}
