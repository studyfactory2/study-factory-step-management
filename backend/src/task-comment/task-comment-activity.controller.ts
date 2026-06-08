import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { TaskCommentService } from "./task-comment.service";

@Controller("task-comments")
export class TaskCommentActivityController {
  constructor(private readonly taskCommentService: TaskCommentService) {}

  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  @Get()
  async findRecent(@Query("limit") limit?: string) {
    const parsedLimit = limit ? Number(limit) : 100;
    const safeLimit = Math.min(Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 100, 1), 100);
    return this.taskCommentService.findRecent(safeLimit);
  }
}
