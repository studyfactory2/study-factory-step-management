import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminOrCeoGuard } from "../auth/guard/admin-or-ceo.guard";
import { JWYAuthGuard } from "../auth/guard/jwy-auth.guard";
import { MemberPreRegistration } from "./entity/member-pre-registration.entity";
import { Member } from "./entity/member.entity";
import { MemberController } from "./member.controller";
import { MemberRepository } from "./member.repository";
import { MemberService } from "./member.service";

@Module({
  imports: [TypeOrmModule.forFeature([Member, MemberPreRegistration])],
  controllers: [MemberController],
  providers: [MemberService, MemberRepository, JWYAuthGuard, AdminOrCeoGuard],
  exports: [MemberService, MemberRepository]
})
export class MemberModule {}
