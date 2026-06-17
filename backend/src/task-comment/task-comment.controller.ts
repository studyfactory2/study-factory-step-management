import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CurrentMember } from "../auth/decorator/current-member.decorator";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentMember as CurrentMemberType } from "../auth/type/current-member.type";
import { UploadFile } from "../upload/type/upload-file.type";
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
  @UseInterceptors(FilesInterceptor("attachments", 10))
  @Post()
  async create(
    @Param("taskId", ParseIntPipe) taskId: number,
    @Body() request: TaskCommentCreateRequest,
    @CurrentMember() currentMember: CurrentMemberType,
    @UploadedFiles() files: UploadFile[] = []
  ) {
    return this.taskCommentService.create(taskId, request, currentMember, files);
  }

  @UseGuards(JWTAuthGuard)
  @Delete(":commentId")
  async delete(
    @Param("taskId", ParseIntPipe) taskId: number,
    @Param("commentId", ParseIntPipe) commentId: number,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    await this.taskCommentService.delete(taskId, commentId, currentMember);
  }
}
