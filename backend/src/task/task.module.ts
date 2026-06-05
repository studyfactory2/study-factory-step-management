import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TaskAttachment } from "./entity/task-attachment.entity";
import { Task } from "./entity/task.entity";
import { TaskController } from "./task.controller";
import { TaskRepository } from "./task.repository";
import { TaskService } from "./task.service";

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskAttachment])],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
  exports: [TaskService, TaskRepository]
})
export class TaskModule {}
