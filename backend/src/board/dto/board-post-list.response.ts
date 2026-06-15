import { BoardPostType } from "../enum/board-post-type.enum";
import { BoardVisibility } from "../enum/board-visibility.enum";

export type BoardPostCategoryResponse = {
  id: number;
  name: string;
  icon: string | null;
  colorClassName: string | null;
};

export type BoardPostAuthorResponse = {
  id: number;
  name: string;
  displayName: string | null;
  positionName: string | null;
  organizationName: string | null;
};

export type BoardPostListResponse = {
  id: number;
  title: string;
  content: string;
  oneLineComment: string | null;
  postType: BoardPostType;
  visibility: BoardVisibility;
  isPinned: boolean;
  author: BoardPostAuthorResponse;
  categories: BoardPostCategoryResponse[];
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

export type BoardPostLikeToggleResponse = {
  likedByMe: boolean;
  likeCount: number;
};

export type BoardPostAttachmentResponse = {
  id: number;
  imageUrl: string;
  originalName: string | null;
  displayOrder: number;
};

export type BoardPostCommentResponse = {
  id: number;
  content: string;
  author: BoardPostAuthorResponse;
  createdAt: string;
  updatedAt: string;
};

export type BoardPostDetailResponse = BoardPostListResponse & {
  attachments: BoardPostAttachmentResponse[];
  comments: BoardPostCommentResponse[];
};
