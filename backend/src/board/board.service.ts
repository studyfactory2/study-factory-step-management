import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UploadFile } from "../upload/type/upload-file.type";
import { UploadService } from "../upload/upload.service";
import { BoardRepository } from "./board.repository";
import { BoardCommentCreateRequest } from "./dto/board-comment-create.request";
import { BoardCommentUpdateRequest } from "./dto/board-comment-update.request";
import { BoardPostCreateRequest } from "./dto/board-post-create.request";
import { BoardPostUpdateRequest } from "./dto/board-post-update.request";
import {
  BoardPostCommentResponse,
  BoardPostCategoryResponse,
  BoardPostCreateResponse,
  BoardPostDetailResponse,
  BoardPostLikeToggleResponse,
  BoardPostListResponse
} from "./dto/board-post-list.response";
import { BoardComment } from "./entity/board-comment.entity";
import { BoardPostAttachment } from "./entity/board-post-attachment.entity";
import { BoardPostCategory } from "./entity/board-post-category.entity";
import { BoardPost } from "./entity/board-post.entity";
import { BoardPostType } from "./enum/board-post-type.enum";
import { BoardVisibility } from "./enum/board-visibility.enum";

const BOARD_VIEW_DEDUPLICATION_WINDOW_MS = 5000;

@Injectable()
export class BoardService {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly uploadService: UploadService
  ) {}

  async findCategories(): Promise<BoardPostCategoryResponse[]> {
    const categories = await this.boardRepository.findActiveCategories();

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      colorClassName: category.colorClassName
    }));
  }

  async createPost(
    request: BoardPostCreateRequest,
    creatorId: number,
    files: UploadFile[] = []
  ): Promise<BoardPostCreateResponse> {
    const post = new BoardPost();
    post.title = request.title.trim();
    post.content = request.content.trim();
    post.oneLineComment = request.oneLineComment?.trim() || null;
    post.postType = BoardPostType.EMPLOYEE;
    post.visibility = request.visibility ?? BoardVisibility.ALL;
    post.createdBy = creatorId;
    post.isPinned = false;
    post.isActive = true;

    const savedPost = await this.boardRepository.savePost(post);
    const categories = await this.boardRepository.findActiveCategoriesByIds(
      this.parseCategoryIds(request.categoryIds).slice(0, 2)
    );

    await this.boardRepository.savePostCategories(
      categories.map((category) => {
        const postCategory = new BoardPostCategory();
        postCategory.postId = savedPost.id;
        postCategory.categoryId = category.id;
        return postCategory;
      })
    );

    const storedFiles = await this.uploadService.saveImages(files.slice(0, 5));
    await this.boardRepository.saveAttachments(
      storedFiles.map((file, index) => {
        const attachment = new BoardPostAttachment();
        attachment.postId = savedPost.id;
        attachment.imageUrl = file.imageUrl;
        attachment.originalName = file.originalName;
        attachment.displayOrder = index;
        return attachment;
      })
    );

    return {
      postId: savedPost.id
    };
  }

  async createComment(
    postId: number,
    request: BoardCommentCreateRequest,
    creatorId: number
  ): Promise<BoardPostCommentResponse> {
    const post = await this.boardRepository.findActivePostById(postId);

    if (!post) {
      throw new NotFoundException("게시글을 찾을 수 없습니다.");
    }

    const comment = new BoardComment();
    comment.postId = postId;
    comment.createdBy = creatorId;
    comment.content = request.content.trim();
    comment.isActive = true;

    const savedComment = await this.boardRepository.saveComment(comment);
    const loadedComment = await this.boardRepository.findActiveCommentById(savedComment.id);

    if (!loadedComment) {
      throw new NotFoundException("댓글을 찾을 수 없습니다.");
    }

    return this.toCommentResponse(loadedComment);
  }

  async updateComment(
    postId: number,
    commentId: number,
    request: BoardCommentUpdateRequest,
    memberId: number
  ): Promise<BoardPostCommentResponse> {
    const comment = await this.boardRepository.findActiveCommentById(commentId);

    if (!comment || comment.postId !== postId) {
      throw new NotFoundException("댓글을 찾을 수 없습니다.");
    }

    this.validateCommentOwner(comment, memberId);
    comment.content = request.content.trim();

    const savedComment = await this.boardRepository.saveComment(comment);
    const loadedComment = await this.boardRepository.findActiveCommentById(savedComment.id);

    if (!loadedComment) {
      throw new NotFoundException("댓글을 찾을 수 없습니다.");
    }

    return this.toCommentResponse(loadedComment);
  }

  async deleteComment(postId: number, commentId: number, memberId: number): Promise<void> {
    const comment = await this.boardRepository.findActiveCommentById(commentId);

    if (!comment || comment.postId !== postId) {
      throw new NotFoundException("댓글을 찾을 수 없습니다.");
    }

    this.validateCommentOwner(comment, memberId);
    comment.isActive = false;
    await this.boardRepository.saveComment(comment);
  }

  async updatePost(
    postId: number,
    request: BoardPostUpdateRequest,
    memberId: number
  ): Promise<BoardPostDetailResponse> {
    const post = await this.boardRepository.findActivePostById(postId);

    if (!post) {
      throw new NotFoundException("게시글을 찾을 수 없습니다.");
    }

    this.validatePostOwner(post, memberId);

    if (request.title !== undefined) {
      post.title = request.title.trim();
    }

    if (request.content !== undefined) {
      post.content = request.content.trim();
    }

    if (request.oneLineComment !== undefined) {
      post.oneLineComment = request.oneLineComment.trim() || null;
    }

    if (request.visibility !== undefined) {
      post.visibility = request.visibility;
    }

    await this.boardRepository.savePost(post);

    const updatedPost = await this.boardRepository.findActivePostById(postId);

    if (!updatedPost) {
      throw new NotFoundException("게시글을 찾을 수 없습니다.");
    }

    return this.toPostDetailResponse(updatedPost, memberId);
  }

  async deletePost(postId: number, memberId: number): Promise<void> {
    const post = await this.boardRepository.findActivePostById(postId);

    if (!post) {
      throw new NotFoundException("게시글을 찾을 수 없습니다.");
    }

    this.validatePostOwner(post, memberId);
    post.isActive = false;
    await this.boardRepository.savePost(post);
  }

  async findPosts(viewerId: number, type?: BoardPostType): Promise<BoardPostListResponse[]> {
    const posts = await this.boardRepository.findActivePosts(viewerId, type);

    return posts.map((post) => ({
      id: Number(post.id),
      title: post.title,
      content: post.content,
      oneLineComment: post.oneLineComment,
      postType: post.postType,
      visibility: post.visibility as BoardVisibility,
      isPinned: post.isPinned,
      author: {
        id: Number(post.authorId),
        name: post.authorName,
        displayName: post.authorDisplayName,
        positionName: post.authorPositionName,
        organizationName: post.authorOrganizationName
      },
      categories: parseCategories(post.categories),
      likeCount: Number(post.likeCount),
      likedByMe: Boolean(post.likedByMe),
      commentCount: Number(post.commentCount),
      viewCount: Number(post.viewCount),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  }

  async findPostDetail(id: number, viewerId: number): Promise<BoardPostDetailResponse> {
    const activePost = await this.boardRepository.findActivePostById(id);

    if (!activePost) {
      throw new NotFoundException("게시글을 찾을 수 없습니다.");
    }

    const recentViewThreshold = new Date(Date.now() - BOARD_VIEW_DEDUPLICATION_WINDOW_MS);
    await this.boardRepository.createViewIfNotRecent(id, viewerId, recentViewThreshold);

    const post = await this.boardRepository.findActivePostById(id) ?? activePost;

    return this.toPostDetailResponse(post, viewerId);
  }

  async toggleLike(id: number, viewerId: number): Promise<BoardPostLikeToggleResponse> {
    const post = await this.boardRepository.findActivePostById(id);

    if (!post) {
      throw new NotFoundException("게시글을 찾을 수 없습니다.");
    }

    const like = await this.boardRepository.findLike(id, viewerId);

    if (like) {
      await this.boardRepository.deleteLike(like);
      return {
        likedByMe: false,
        likeCount: await this.boardRepository.countLikes(id)
      };
    }

    await this.boardRepository.createLike(id, viewerId);

    return {
      likedByMe: true,
      likeCount: await this.boardRepository.countLikes(id)
    };
  }

  private toPostDetailResponse(post: BoardPost, viewerId: number): BoardPostDetailResponse {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      oneLineComment: post.oneLineComment,
      postType: post.postType,
      visibility: post.visibility,
      isPinned: post.isPinned,
      author: {
        id: post.creator.id,
        name: post.creator.name,
        displayName: post.creator.displayName,
        positionName: post.creator.positionInfo?.name ?? null,
        organizationName: post.creator.organization?.name ?? null
      },
      categories: post.postCategories
        .filter((postCategory) => postCategory.category?.isActive)
        .map((postCategory) => ({
          id: postCategory.category.id,
          name: postCategory.category.name,
          icon: postCategory.category.icon,
          colorClassName: postCategory.category.colorClassName
        })),
      attachments: post.attachments.map((attachment) => ({
        id: attachment.id,
        imageUrl: attachment.imageUrl,
        originalName: attachment.originalName,
        displayOrder: attachment.displayOrder
      })),
      comments: post.comments.map((comment) => this.toCommentResponse(comment)),
      likeCount: post.likes.length,
      likedByMe: post.likes.some((like) => like.memberId === viewerId),
      commentCount: post.comments.length,
      viewCount: post.views.length,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  }

  private validatePostOwner(post: BoardPost, memberId: number): void {
    if (post.createdBy !== memberId) {
      throw new ForbiddenException("작성자만 수정하거나 삭제할 수 있습니다.");
    }
  }

  private validateCommentOwner(comment: BoardComment, memberId: number): void {
    if (comment.createdBy !== memberId) {
      throw new ForbiddenException("작성자만 수정하거나 삭제할 수 있습니다.");
    }
  }

  private toCommentResponse(comment: BoardComment): BoardPostCommentResponse {
    return {
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.creator.id,
        name: comment.creator.name,
        displayName: comment.creator.displayName,
        positionName: comment.creator.positionInfo?.name ?? null,
        organizationName: comment.creator.organization?.name ?? null
      },
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString()
    };
  }

  private parseCategoryIds(categoryIds: string | string[] | undefined): number[] {
    const rawCategoryIds = Array.isArray(categoryIds) ? categoryIds : categoryIds ? [categoryIds] : [];

    return Array.from(
      new Set(
        rawCategoryIds
          .flatMap((value) => String(value).split(","))
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value > 0)
      )
    );
  }
}

function parseCategories(categories: unknown): BoardPostListResponse["categories"] {
  if (Array.isArray(categories)) {
    return categories
      .map(normalizeCategory)
      .filter((category): category is BoardPostListResponse["categories"][number] => category !== null);
  }

  if (typeof categories === "string") {
    try {
      const parsed = JSON.parse(categories) as unknown;
      return parseCategories(parsed);
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeCategory(category: unknown): BoardPostListResponse["categories"][number] | null {
  if (!category || typeof category !== "object") {
    return null;
  }

  const categoryRecord = category as Record<string, unknown>;
  const id = Number(categoryRecord.id);
  const name = typeof categoryRecord.name === "string" ? categoryRecord.name : "";

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    icon: typeof categoryRecord.icon === "string" ? categoryRecord.icon : null,
    colorClassName: typeof categoryRecord.colorClassName === "string" ? categoryRecord.colorClassName : null
  };
}
