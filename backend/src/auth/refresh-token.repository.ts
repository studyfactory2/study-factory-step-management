import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RefreshToken } from "./entity/refresh-token.entity";

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>
  ) {}

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { token }
    });
  }

  async save(refreshToken: RefreshToken): Promise<RefreshToken> {
    return this.refreshTokenRepository.save(refreshToken);
  }

  async upsertByMemberId(refreshToken: RefreshToken): Promise<void> {
    await this.refreshTokenRepository.upsert(refreshToken, ["memberId"]);
  }

  async deleteByMemberId(memberId: number): Promise<void> {
    await this.refreshTokenRepository.delete({ memberId });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.refreshTokenRepository.delete({ token });
  }
}
