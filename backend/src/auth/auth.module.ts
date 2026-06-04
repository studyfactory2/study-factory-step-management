import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MemberModule } from "../member/member.module";
import { AuthController } from "./auth.controller";
import { RefreshToken } from "./entity/refresh-token.entity";
import { AuthService } from "./auth.service";
import { RefreshTokenRepository } from "./refresh-token.repository";
import { JwtAuthStrategy } from "./strategy/jwt-auth.strategy";

@Module({
  imports: [MemberModule, TypeOrmModule.forFeature([RefreshToken])],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenRepository, JwtAuthStrategy],
  exports: [AuthService]
})
export class AuthModule {}
