import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { CreateTaskInput } from "../../libs/dto/task/create-task.input";
import { CreateTaskAttachmentInput } from "../../libs/dto/task/create-task-attachment.input";
import { CreateTaskUpdateInput } from "../../libs/dto/task/create-task-update.input";
import { UpdateTaskStatusInput } from "../../libs/dto/task/update-task-status.input";
import { TaskService } from "./task.service";

@Controller("tasks")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() createTaskInput: CreateTaskInput) {
    return this.taskService.create(createTaskInput);
  }

  @Get()
  findAll(
    @Query("status") status?: TaskStatus,
    @Query("assigneeId") assigneeId?: string,
    @Query("priority") priority?: TaskPriority,
  ) {
    return this.taskService.findAll({ status, assigneeId, priority });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.taskService.findOne(id);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() updateTaskStatusInput: UpdateTaskStatusInput,
  ) {
    return this.taskService.updateStatus(id, updateTaskStatusInput);
  }

  @Post(":id/feedback")
  addFeedback(
    @Param("id") id: string,
    @Body() createTaskUpdateInput: CreateTaskUpdateInput,
  ) {
    return this.taskService.addFeedback(id, createTaskUpdateInput);
  }

  @Post(":id/attachments")
  addAttachment(
    @Param("id") id: string,
    @Body() createTaskAttachmentInput: CreateTaskAttachmentInput,
  ) {
    return this.taskService.addAttachment(id, createTaskAttachmentInput);
  }
}
