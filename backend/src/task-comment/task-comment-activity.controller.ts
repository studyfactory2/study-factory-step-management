import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CurrentMember } from "../auth/decorator/current-member.decorator";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentMember as CurrentMemberType } from "../auth/type/current-member.type";
import { TaskCommentService } from "./task-comment.service";

@Controller("task-comments")
export class TaskCommentActivityController {
  constructor(private readonly taskCommentService: TaskCommentService) {}

  @UseGuards(JWTAuthGuard)
  @Get()
  async findRecent(
    @Query("limit") limit: string | undefined,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    const parsedLimit = limit ? Number(limit) : 100;
    const safeLimit = Math.min(Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 100, 1), 100);
    return this.taskCommentService.findRecent(safeLimit, currentMember);
  }
}
