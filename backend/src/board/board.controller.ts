import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CurrentMember } from "../auth/decorator/current-member.decorator";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentMember as CurrentMemberType } from "../auth/type/current-member.type";
import { UploadFile } from "../upload/type/upload-file.type";
import { BoardService } from "./board.service";
import { BoardCommentCreateRequest } from "./dto/board-comment-create.request";
import { BoardCommentUpdateRequest } from "./dto/board-comment-update.request";
import { BoardPostCreateRequest } from "./dto/board-post-create.request";
import { BoardPostListQueryRequest } from "./dto/board-post-list-query.request";
import { BoardPostUpdateRequest } from "./dto/board-post-update.request";

@UseGuards(JWTAuthGuard)
@Controller("board")
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get("categories")
  async findCategories() {
    return this.boardService.findCategories();
  }

  @Get("posts")
  async findPosts(
    @Query() query: BoardPostListQueryRequest,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.boardService.findPosts(currentMember.memberId, query.type);
  }

  @Get("posts/:id")
  async findPostDetail(
    @Param("id", ParseIntPipe) id: number,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.boardService.findPostDetail(id, currentMember.memberId);
  }

  @Post("posts/:id/like")
  async toggleLike(
    @Param("id", ParseIntPipe) id: number,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.boardService.toggleLike(id, currentMember.memberId);
  }

  @Patch("posts/:id")
  async updatePost(
    @Param("id", ParseIntPipe) id: number,
    @Body() request: BoardPostUpdateRequest,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.boardService.updatePost(id, request, currentMember.memberId);
  }

  @Delete("posts/:id")
  async deletePost(
    @Param("id", ParseIntPipe) id: number,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    await this.boardService.deletePost(id, currentMember.memberId);
  }

  @Post("posts/:id/comments")
  async createComment(
    @Param("id", ParseIntPipe) id: number,
    @Body() request: BoardCommentCreateRequest,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.boardService.createComment(id, request, currentMember.memberId);
  }

  @Patch("posts/:postId/comments/:commentId")
  async updateComment(
    @Param("postId", ParseIntPipe) postId: number,
    @Param("commentId", ParseIntPipe) commentId: number,
    @Body() request: BoardCommentUpdateRequest,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    return this.boardService.updateComment(postId, commentId, request, currentMember.memberId);
  }

  @Delete("posts/:postId/comments/:commentId")
  async deleteComment(
    @Param("postId", ParseIntPipe) postId: number,
    @Param("commentId", ParseIntPipe) commentId: number,
    @CurrentMember() currentMember: CurrentMemberType
  ) {
    await this.boardService.deleteComment(postId, commentId, currentMember.memberId);
  }

  @UseInterceptors(FilesInterceptor("attachments", 5))
  @Post("posts")
  async createPost(
    @Body() request: BoardPostCreateRequest,
    @CurrentMember() currentMember: CurrentMemberType,
    @UploadedFiles() files: UploadFile[] = []
  ) {
    return this.boardService.createPost(request, currentMember.memberId, files);
  }
}
