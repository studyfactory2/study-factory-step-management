import { Module } from "@nestjs/common";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { MemberModule } from "../member/member.module";
import { TaskModule } from "../task/task.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AdminOrCeoGuard } from "./guard/admin-or-ceo.guard";

@Module({
  imports: [MemberModule, TaskModule],
  controllers: [AdminController],
  providers: [AdminService, JWTAuthGuard, AdminOrCeoGuard]
})
export class AdminModule {}
