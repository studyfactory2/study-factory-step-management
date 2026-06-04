import { Module } from "@nestjs/common";
import { MemberModule } from "../member/member.module";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";

@Module({
  imports: [MemberModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository]
})
export class AuthModule {}
