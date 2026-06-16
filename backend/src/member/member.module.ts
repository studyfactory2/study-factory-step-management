import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { PositionModule } from "../position/position.module";
import { UploadModule } from "../upload/upload.module";
import { MemberPreRegistration } from "./entity/member-pre-registration.entity";
import { Member } from "./entity/member.entity";
import { OrganizationBranch } from "./entity/organization-branch.entity";
import { Organization } from "./entity/organization.entity";
import { MemberController } from "./member.controller";
import { MemberRepository } from "./member.repository";
import { MemberService } from "./member.service";

@Module({
  imports: [TypeOrmModule.forFeature([Member, MemberPreRegistration, Organization, OrganizationBranch]), PositionModule, UploadModule],
  controllers: [MemberController],
  providers: [MemberService, MemberRepository, JWTAuthGuard, AdminOrCeoGuard],
  exports: [MemberService, MemberRepository]
})
export class MemberModule {}
