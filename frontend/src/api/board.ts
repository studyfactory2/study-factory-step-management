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
  likedByMe: boolean;
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

export type BoardPostDraft = {
  id: number;
  title: string;
  content: string;
  oneLineComment: string | null;
  postType: BoardPostType;
  visibility: BoardVisibility;
  categoryIds: number[];
  attachments: BoardPostAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type BoardPostLikeToggleResponse = {
  likedByMe: boolean;
  likeCount: number;
};

export type BoardPostCreateRequest = {
  attachments?: File[];
  categoryIds: number[];
  content: string;
  oneLineComment?: string;
  postType?: BoardPostType;
  title: string;
  visibility: BoardVisibility;
};

export type BoardPostCreateResponse = {
  postId: number;
};

export type BoardPostDraftSaveRequest = {
  attachments?: File[];
  categoryIds: number[];
  content: string;
  keepAttachmentIds?: number[];
  oneLineComment?: string;
  postType?: BoardPostType;
  title: string;
  visibility: BoardVisibility;
};

export type BoardPostUpdateRequest = {
  content: string;
  oneLineComment?: string;
  title: string;
  visibility: BoardVisibility;
};

export type BoardCommentCreateRequest = {
  content: string;
};

export type BoardCommentUpdateRequest = {
  content: string;
};

export async function getBoardCategories(accessToken: string): Promise<BoardPostCategory[]> {
  const response = await fetch(`${API_BASE_URL}/api/board/categories`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("게시판 카테고리를 불러오지 못했습니다.");
  }

  return response.json() as Promise<BoardPostCategory[]>;
}

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

export async function getLatestBoardPostDraft(accessToken: string): Promise<BoardPostDraft | null> {
  const response = await fetch(`${API_BASE_URL}/api/board/post-drafts/latest`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("임시저장 게시글을 불러오지 못했습니다.");
  }

  return response.json() as Promise<BoardPostDraft | null>;
}

export async function toggleBoardPostLike(
  accessToken: string,
  postId: number
): Promise<BoardPostLikeToggleResponse> {
  const response = await fetch(`${API_BASE_URL}/api/board/posts/${postId}/like`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("좋아요를 변경하지 못했습니다.");
  }

  return response.json() as Promise<BoardPostLikeToggleResponse>;
}

export async function updateBoardPost(
  accessToken: string,
  postId: number,
  request: BoardPostUpdateRequest
): Promise<BoardPostDetail> {
  const response = await fetch(`${API_BASE_URL}/api/board/posts/${postId}`, {
    method: "PATCH",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("게시글을 수정하지 못했습니다.");
  }

  return response.json() as Promise<BoardPostDetail>;
}

export async function deleteBoardPost(accessToken: string, postId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/board/posts/${postId}`, {
    method: "DELETE",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("게시글을 삭제하지 못했습니다.");
  }
}

export async function updateBoardComment(
  accessToken: string,
  postId: number,
  commentId: number,
  request: BoardCommentUpdateRequest
): Promise<BoardPostComment> {
  const response = await fetch(`${API_BASE_URL}/api/board/posts/${postId}/comments/${commentId}`, {
    method: "PATCH",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("댓글을 수정하지 못했습니다.");
  }

  return response.json() as Promise<BoardPostComment>;
}

export async function deleteBoardComment(
  accessToken: string,
  postId: number,
  commentId: number
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/board/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("댓글을 삭제하지 못했습니다.");
  }
}

export async function createBoardPost(
  accessToken: string,
  request: BoardPostCreateRequest
): Promise<BoardPostCreateResponse> {
  const formData = new FormData();
  formData.append("title", request.title);
  formData.append("content", request.content);
  formData.append("visibility", request.visibility);
  formData.append("postType", request.postType ?? "EMPLOYEE");

  if (request.oneLineComment) {
    formData.append("oneLineComment", request.oneLineComment);
  }

  request.categoryIds.forEach((categoryId) => {
    formData.append("categoryIds", String(categoryId));
  });

  request.attachments?.forEach((attachment) => {
    formData.append("attachments", attachment);
  });

  const response = await fetch(`${API_BASE_URL}/api/board/posts`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: formData
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("게시글을 등록하지 못했습니다.");
  }

  return response.json() as Promise<BoardPostCreateResponse>;
}

export async function saveBoardPostDraft(
  accessToken: string,
  request: BoardPostDraftSaveRequest,
  draftId?: number
): Promise<BoardPostDraft> {
  const formData = createBoardDraftFormData(request);
  const response = await fetch(`${API_BASE_URL}/api/board/post-drafts${draftId ? `/${draftId}` : ""}`, {
    method: draftId ? "PATCH" : "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: formData
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("게시글을 임시저장하지 못했습니다.");
  }

  return response.json() as Promise<BoardPostDraft>;
}

export async function deleteBoardPostDraft(accessToken: string, draftId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/board/post-drafts/${draftId}`, {
    method: "DELETE",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("임시저장 게시글을 삭제하지 못했습니다.");
  }
}

export async function publishBoardPostDraft(
  accessToken: string,
  draftId: number
): Promise<BoardPostCreateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/board/post-drafts/${draftId}/publish`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("임시저장 게시글을 등록하지 못했습니다.");
  }

  return response.json() as Promise<BoardPostCreateResponse>;
}

function createBoardDraftFormData(request: BoardPostDraftSaveRequest) {
  const formData = new FormData();
  formData.append("title", request.title);
  formData.append("content", request.content);
  formData.append("visibility", request.visibility);
  formData.append("postType", request.postType ?? "EMPLOYEE");

  if (request.oneLineComment) {
    formData.append("oneLineComment", request.oneLineComment);
  }

  request.categoryIds.forEach((categoryId) => {
    formData.append("categoryIds", String(categoryId));
  });

  request.keepAttachmentIds?.forEach((attachmentId) => {
    formData.append("keepAttachmentIds", String(attachmentId));
  });

  request.attachments?.forEach((attachment) => {
    formData.append("attachments", attachment);
  });

  return formData;
}

export async function createBoardComment(
  accessToken: string,
  postId: number,
  request: BoardCommentCreateRequest
): Promise<BoardPostComment> {
  const response = await fetch(`${API_BASE_URL}/api/board/posts/${postId}/comments`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("댓글을 등록하지 못했습니다.");
  }

  return response.json() as Promise<BoardPostComment>;
}
