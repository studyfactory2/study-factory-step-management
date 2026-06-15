import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { CurrentMember } from "../auth/decorator/current-member.decorator";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentMember as CurrentMemberType } from "../auth/type/current-member.type";
import { BoardService } from "./board.service";
import { BoardPostListQueryRequest } from "./dto/board-post-list-query.request";

@UseGuards(JWTAuthGuard)
@Controller("board")
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get("posts")
  async findPosts(@Query() query: BoardPostListQueryRequest) {
    return this.boardService.findPosts(query.type);
  }

  @Get("posts/:id")
  async findPostDetail(
    @Param("id", ParseIntPipe) id: number,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.boardService.findPostDetail(id, currentMember.memberId);
  }
}
