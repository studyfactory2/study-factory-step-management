import * as jwt from "jsonwebtoken";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import { AuthLoginRequest } from "./dto/auth-login.request";
import { AuthLoginResponse } from "./dto/auth-login.response";
import { AuthTokenType } from "./enum/auth-token-type.enum";
import { InvalidCredentialsException } from "./exception/invalid-credentials.exception";
import { InvalidTokenException } from "./exception/invalid-token.exception";
import { Member } from "../member/entity/member.entity";
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

    return this.issueAuthResponse(member);
  }

  async refresh(refreshToken: string): Promise<AuthLoginResponse> {
    const payload = this.verifyToken(refreshToken) as JwtPayload;

    if (payload.tokenType !== AuthTokenType.REFRESH) {
      throw new InvalidTokenException();
    }

    const savedRefreshToken = await this.refreshTokenRepository.findByToken(refreshToken);

    if (!savedRefreshToken || savedRefreshToken.memberId !== payload.userId) {
      throw new InvalidTokenException();
    }

    const member = await this.memberRepository.findById(payload.userId);

    if (!member || !member.isActive) {
      await this.refreshTokenRepository.deleteByToken(refreshToken);
      throw new InvalidTokenException();
    }

    return this.issueAuthResponse(member);
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
    const refreshToken = new RefreshToken();
    refreshToken.memberId = memberId;
    refreshToken.token = token;

    await this.refreshTokenRepository.upsertByMemberId(refreshToken);
  }

  private async issueAuthResponse(member: Member): Promise<AuthLoginResponse> {
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
        branch: member.branchInfo?.name ?? null,
        organizationId: member.organizationId,
        organizationName: member.organization?.name ?? null,
        branchId: member.branchId,
        branchName: member.branchInfo?.name ?? null,
        positionName: member.positionInfo?.name ?? null,
        roleType: member.roleType
      }
    };
  }

  private createPasswordHash(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }
}
