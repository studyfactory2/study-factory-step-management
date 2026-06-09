import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { CurrentMember } from "../auth/decorator/current-member.decorator";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentMember as CurrentMemberType } from "../auth/type/current-member.type";
import { TaskCommentCreateRequest } from "./dto/task-comment-create.request";
import { TaskCommentService } from "./task-comment.service";

@Controller("tasks/:taskId/comments")
export class TaskCommentController {
  constructor(private readonly taskCommentService: TaskCommentService) {}

  @UseGuards(JWTAuthGuard)
  @Get()
  async findByTaskId(
    @Param("taskId", ParseIntPipe) taskId: number,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.taskCommentService.findByTaskId(taskId, currentMember);
  }

  @UseGuards(JWTAuthGuard)
  @Post()
  async create(
    @Param("taskId", ParseIntPipe) taskId: number,
    @Body() request: TaskCommentCreateRequest,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.taskCommentService.create(taskId, request, currentMember);
  }
}
