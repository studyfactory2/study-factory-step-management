import { Injectable } from "@nestjs/common";
import { BoardRepository } from "./board.repository";
import { BoardPostListResponse } from "./dto/board-post-list.response";
import { BoardPostType } from "./enum/board-post-type.enum";
import { BoardVisibility } from "./enum/board-visibility.enum";

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async findPosts(type?: BoardPostType): Promise<BoardPostListResponse[]> {
    const posts = await this.boardRepository.findActivePosts(type);

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
      commentCount: Number(post.commentCount),
      viewCount: Number(post.viewCount),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
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
