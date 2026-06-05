import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { CurrentMember } from "../auth/decorator/current-member.decorator";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentMember as CurrentMemberType } from "../auth/type/current-member.type";
import { TaskCreateRequest } from "./dto/task-create.request";
import { TaskService } from "./task.service";

@Controller("tasks")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get("status-summary")
  async getStatusSummary() {
    return this.taskService.getStatusSummary();
  }

  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  @Post()
  async create(@Body() request: TaskCreateRequest, @CurrentMember() currentMember: CurrentMemberType) {
    return this.taskService.create(request, currentMember);
  }
}
