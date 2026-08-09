import * as jwt from "jsonwebtoken";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import { RedisCacheService } from "../cache/redis-cache.service";
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
import { REFRESH_TOKEN_CACHE_KEYS } from "./refresh-token-cache";

@Injectable()
export class AuthService {
  private readonly jwtSecretKey: string;
  private readonly refreshTokenTtlSeconds: number;

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly configService: ConfigService,
    private readonly cacheService: RedisCacheService
  ) {
    this.jwtSecretKey = this.configService.getOrThrow<string>("jwt.secretKey");
    this.refreshTokenTtlSeconds = this.parseExpiresInSeconds(
      this.configService.getOrThrow<string>("jwt.refreshExpiresIn")
    );
  }

  async login(loginRequest: AuthLoginRequest): Promise<AuthLoginResponse> {
    const passwordHash = this.createPasswordHash(loginRequest.password);
    const member = await this.memberRepository.findByNameAndPasswordHash(
      loginRequest.name,
      passwordHash
    );

    if (!member || !member.isActive) {
      throw new InvalidCredentialsException();
    }

    return this.issueAuthResponse(member);
  }

  async refresh(refreshToken: string): Promise<AuthLoginResponse> {
    const payload = this.verifyToken(refreshToken) as JwtPayload;

    if (payload.tokenType !== AuthTokenType.REFRESH) {
      throw new InvalidTokenException();
    }

    const cachedMemberId = await this.findRefreshTokenMemberId(refreshToken);

    if (cachedMemberId !== payload.userId) {
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

    const previousToken = await this.cacheService.getString(REFRESH_TOKEN_CACHE_KEYS.memberToken(memberId));
    const keysToDelete = previousToken
      ? [REFRESH_TOKEN_CACHE_KEYS.tokenMember(previousToken)]
      : [];

    if (keysToDelete.length > 0) {
      await this.cacheService.delete(keysToDelete);
    }

    const [savedMemberToken, savedTokenMember] = await Promise.all([
      this.cacheService.setString(
        REFRESH_TOKEN_CACHE_KEYS.memberToken(memberId),
        token,
        this.refreshTokenTtlSeconds
      ),
      this.cacheService.setString(
        REFRESH_TOKEN_CACHE_KEYS.tokenMember(token),
        String(memberId),
        this.refreshTokenTtlSeconds
      )
    ]);

    if (!savedMemberToken || !savedTokenMember) {
      await this.refreshTokenRepository.upsertByMemberId(refreshToken);
      return;
    }

    void this.refreshTokenRepository.upsertByMemberId(refreshToken).catch(() => undefined);
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

  private async findRefreshTokenMemberId(refreshToken: string): Promise<number | null> {
    const cachedMemberId = await this.cacheService.getString(REFRESH_TOKEN_CACHE_KEYS.tokenMember(refreshToken));
    if (cachedMemberId) {
      return Number(cachedMemberId);
    }

    const savedRefreshToken = await this.refreshTokenRepository.findByToken(refreshToken);
    if (!savedRefreshToken) {
      return null;
    }

    await Promise.all([
      this.cacheService.setString(
        REFRESH_TOKEN_CACHE_KEYS.memberToken(savedRefreshToken.memberId),
        savedRefreshToken.token,
        this.refreshTokenTtlSeconds
      ),
      this.cacheService.setString(
        REFRESH_TOKEN_CACHE_KEYS.tokenMember(savedRefreshToken.token),
        String(savedRefreshToken.memberId),
        this.refreshTokenTtlSeconds
      )
    ]);

    return savedRefreshToken.memberId;
  }

  private parseExpiresInSeconds(expiresIn: string): number {
    const match = expiresIn.trim().match(/^(\d+)([smhd])?$/);
    if (!match) {
      return 60 * 60 * 24 * 14;
    }

    const amount = Number(match[1]);
    const unit = match[2] ?? "s";
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 60 * 60 * 24
    };

    return amount * multipliers[unit];
  }
}
