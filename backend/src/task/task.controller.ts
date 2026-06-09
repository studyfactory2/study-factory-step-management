import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { CurrentMember } from "../auth/decorator/current-member.decorator";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentMember as CurrentMemberType } from "../auth/type/current-member.type";
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

  @UseGuards(JWTAuthGuard)
  @Get("recent-work-status")
  async findRecentWorkStatus(
    @Query() query: TaskRecentWorkStatusQueryRequest,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.taskService.findRecentWorkStatus(query, currentMember);
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
  @Post()
  async create(@Body() request: TaskCreateRequest, @CurrentMember() currentMember: CurrentMemberType) {
    return this.taskService.create(request, currentMember);
  }
}
