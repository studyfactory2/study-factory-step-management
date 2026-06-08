import { Module } from "@nestjs/common";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { FavoriteMemberModule } from "../favorite-member/favorite-member.module";
import { MemberModule } from "../member/member.module";
import { TaskModule } from "../task/task.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AdminOrCeoGuard } from "./guard/admin-or-ceo.guard";

@Module({
  imports: [FavoriteMemberModule, MemberModule, TaskModule],
  controllers: [AdminController],
  providers: [AdminService, JWTAuthGuard, AdminOrCeoGuard]
})
export class AdminModule {}
