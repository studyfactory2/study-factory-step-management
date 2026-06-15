import { Injectable, NotFoundException } from "@nestjs/common";
import { BoardRepository } from "./board.repository";
import { BoardPostDetailResponse, BoardPostLikeToggleResponse, BoardPostListResponse } from "./dto/board-post-list.response";
import { BoardPostType } from "./enum/board-post-type.enum";
import { BoardVisibility } from "./enum/board-visibility.enum";

const BOARD_VIEW_DEDUPLICATION_WINDOW_MS = 5000;

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

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
      comments: post.comments.map((comment) => ({
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
      })),
      likeCount: post.likes.length,
      likedByMe: post.likes.some((like) => like.memberId === viewerId),
      commentCount: post.comments.length,
      viewCount: post.views.length,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
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
