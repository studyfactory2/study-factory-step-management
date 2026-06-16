import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { MemberModule } from "../member/member.module";
import { NotificationModule } from "../notification/notification.module";
import { UploadModule } from "../upload/upload.module";
import { TaskAttachment } from "./entity/task-attachment.entity";
import { Task } from "./entity/task.entity";
import { TaskReadStatus } from "./entity/task-read-status.entity";
import { TaskController } from "./task.controller";
import { TaskRepository } from "./task.repository";
import { TaskService } from "./task.service";

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskAttachment, TaskReadStatus]), MemberModule, NotificationModule, UploadModule],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository, JWTAuthGuard, AdminOrCeoGuard],
  exports: [TaskService, TaskRepository]
})
export class TaskModule {}
