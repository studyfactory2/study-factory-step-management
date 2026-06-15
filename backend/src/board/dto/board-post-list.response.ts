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
  commentCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};
