import { handleUnauthorizedResponse } from "@/api/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type BoardPostType = "NOTICE" | "EMPLOYEE";
export type BoardVisibility = "ALL" | "TEAM";

export type BoardPostCategory = {
  id: number;
  name: string;
  icon: string | null;
  colorClassName: string | null;
};

export type BoardPostAuthor = {
  id: number;
  name: string;
  displayName: string | null;
  positionName: string | null;
  organizationName: string | null;
};

export type BoardPost = {
  id: number;
  title: string;
  content: string;
  oneLineComment: string | null;
  postType: BoardPostType;
  visibility: BoardVisibility;
  isPinned: boolean;
  author: BoardPostAuthor;
  categories: BoardPostCategory[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

export type BoardPostAttachment = {
  id: number;
  imageUrl: string;
  originalName: string | null;
  displayOrder: number;
};

export type BoardPostComment = {
  id: number;
  content: string;
  author: BoardPostAuthor;
  createdAt: string;
  updatedAt: string;
};

export type BoardPostDetail = BoardPost & {
  attachments: BoardPostAttachment[];
  comments: BoardPostComment[];
};

export async function getBoardPosts(accessToken: string, type?: BoardPostType): Promise<BoardPost[]> {
  const params = new URLSearchParams();

  if (type) {
    params.set("type", type);
  }

  const response = await fetch(`${API_BASE_URL}/api/board/posts${params.toString() ? `?${params.toString()}` : ""}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("게시판 데이터를 불러오지 못했습니다.");
  }

  return response.json() as Promise<BoardPost[]>;
}

export async function getBoardPostDetail(accessToken: string, postId: number): Promise<BoardPostDetail> {
  const response = await fetch(`${API_BASE_URL}/api/board/posts/${postId}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("게시글 상세를 불러오지 못했습니다.");
  }

  return response.json() as Promise<BoardPostDetail>;
}
