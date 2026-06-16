import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { CurrentMember } from "../auth/decorator/current-member.decorator";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentMember as CurrentMemberType } from "../auth/type/current-member.type";
import { UploadFile } from "../upload/type/upload-file.type";
import { TaskCreateRequest } from "./dto/task-create.request";
import { TaskDescriptionUpdateRequest } from "./dto/task-description-update.request";
import { TaskDraftSaveRequest } from "./dto/task-draft-save.request";
import { TaskRecentWorkStatusQueryRequest } from "./dto/task-recent-work-status-query.request";
import { TaskService } from "./task.service";

@Controller("tasks")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get("status-summary")
  async getStatusSummary() {
    return this.taskService.getStatusSummary();
  }

  @Get("status-summary/branches")
  async getStatusSummaryByBranch() {
    return this.taskService.getStatusSummaryByBranch();
  }

  @Get("category-summary")
  async getCategorySummary(@Query() query: TaskRecentWorkStatusQueryRequest) {
    return this.taskService.getCategorySummary(query);
  }

  @UseGuards(JWTAuthGuard)
  @Get("recent-work-status")
  async findRecentWorkStatus(
    @Query() query: TaskRecentWorkStatusQueryRequest,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.taskService.findRecentWorkStatus(query, currentMember);
  }

  @UseGuards(JWTAuthGuard)
  @Get("all-work-status")
  async findAllWorkStatus(
    @Query() query: TaskRecentWorkStatusQueryRequest,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.taskService.findAllWorkStatus(query, currentMember);
  }

  @UseGuards(JWTAuthGuard)
  @Get("drafts")
  async findDrafts(@CurrentMember() currentMember: CurrentMemberType) {
    return this.taskService.findDrafts(currentMember);
  }

  @UseGuards(JWTAuthGuard)
  @Post("drafts")
  async createDraft(
    @Body() request: TaskDraftSaveRequest,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.taskService.createDraft(request, currentMember);
  }

  @UseGuards(JWTAuthGuard)
  @Patch("drafts/:id")
  async updateDraft(
    @Param("id", ParseIntPipe) id: number,
    @Body() request: TaskDraftSaveRequest,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.taskService.updateDraft(id, request, currentMember);
  }

  @UseGuards(JWTAuthGuard)
  @Post("drafts/:id/publish")
  async publishDraft(
    @Param("id", ParseIntPipe) id: number,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.taskService.publishDraft(id, currentMember);
  }

  @UseGuards(JWTAuthGuard)
  @Delete("drafts/:id")
  async deleteDraft(
    @Param("id", ParseIntPipe) id: number,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    await this.taskService.deleteDraft(id, currentMember);
  }

  @UseGuards(JWTAuthGuard)
  @Get(":id")
  async findDetail(
    @Param("id", ParseIntPipe) id: number,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.taskService.findDetail(id, currentMember);
  }

  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  @Patch(":id/description")
  async updateDescription(
    @Param("id", ParseIntPipe) id: number,
    @Body() request: TaskDescriptionUpdateRequest
  ) {
    return this.taskService.updateDescription(id, request);
  }

  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FilesInterceptor("attachments", 10))
  @Post(":id/attachments")
  async addAttachments(
    @Param("id", ParseIntPipe) id: number,
    @CurrentMember() currentMember: CurrentMemberType,
    @UploadedFiles() files: UploadFile[] = []
  ) {
    return this.taskService.addAttachments(id, currentMember, files);
  }

  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FilesInterceptor("attachments", 10))
  @Post()
  async create(
    @Body() request: TaskCreateRequest,
    @CurrentMember() currentMember: CurrentMemberType,
    @UploadedFiles() files: UploadFile[] = []
  ) {
    return this.taskService.create(request, currentMember, files);
  }
}
