import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { CurrentMember } from "../auth/decorator/current-member.decorator";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentMember as CurrentMemberType } from "../auth/type/current-member.type";
import { TaskCommentCreateRequest } from "./dto/task-comment-create.request";
import { TaskCommentService } from "./task-comment.service";

@Controller("tasks/:taskId/comments")
export class TaskCommentController {
  constructor(private readonly taskCommentService: TaskCommentService) {}

  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  @Get()
  async findByTaskId(@Param("taskId", ParseIntPipe) taskId: number) {
    return this.taskCommentService.findByTaskId(taskId);
  }

  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  @Post()
  async create(
    @Param("taskId", ParseIntPipe) taskId: number,
    @Body() request: TaskCommentCreateRequest,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.taskCommentService.create(taskId, request, currentMember);
  }
}
