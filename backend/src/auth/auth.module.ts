import { Module } from "@nestjs/common";
import { MemberModule } from "../member/member.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RefreshTokenRepository } from "./refresh-token.repository";
import { JwtAuthStrategy } from "./strategy/jwt-auth.strategy";

@Module({
  imports: [MemberModule],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenRepository, JwtAuthStrategy],
  exports: [AuthService]
})
export class AuthModule {}
