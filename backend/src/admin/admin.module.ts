import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { Member } from "../member/entity/member.entity";
import { Task } from "../task/entity/task.entity";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AdminOrCeoGuard } from "./guard/admin-or-ceo.guard";

@Module({
  imports: [TypeOrmModule.forFeature([Member, Task])],
  controllers: [AdminController],
  providers: [AdminService, JWTAuthGuard, AdminOrCeoGuard]
})
export class AdminModule {}
