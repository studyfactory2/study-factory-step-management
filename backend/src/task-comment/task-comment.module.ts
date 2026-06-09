import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { Task } from "../task/entity/task.entity";
import { TaskReadStatus } from "../task/entity/task-read-status.entity";
import { TaskCommentActivityController } from "./task-comment-activity.controller";
import { TaskCommentController } from "./task-comment.controller";
import { TaskCommentRepository } from "./task-comment.repository";
import { TaskCommentService } from "./task-comment.service";
import { TaskCommentAttachment } from "./entity/task-comment-attachment.entity";
import { TaskComment } from "./entity/task-comment.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskReadStatus, TaskComment, TaskCommentAttachment])],
  controllers: [TaskCommentController, TaskCommentActivityController],
  providers: [TaskCommentService, TaskCommentRepository, JWTAuthGuard, AdminOrCeoGuard],
  exports: [TaskCommentService, TaskCommentRepository]
})
export class TaskCommentModule {}
