import type { MemberRole, TaskStatus } from "@/types/domain";
import { handleUnauthorizedResponse } from "@/api/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type TaskStatusSummary = {
  registered: number;
  registeredToday: number;
  inProgress: number;
  inProgressWeeklyChange: number;
  reviewRequested: number;
  reviewRequestedWeeklyChange: number;
  completedThisMonth: number;
};

export type TaskStatusSummaryByBranch = TaskStatusSummary & {
  branch: string;
};

export type TaskCategory = "DEVELOPMENT" | "OPERATION" | "MEMBER" | "ORDER";

export type TaskCategorySummaryItem = {
  category: TaskCategory;
  count: number;
};

export type TaskAssigneeScope = "SINGLE" | "ALL";

export type TaskCreateRequest = {
  attachments?: File[];
  title: string;
  description: string;
  category: TaskCategory;
  oneLineComment?: string;
  assigneeScope: TaskAssigneeScope;
  assigneeId?: number;
  branch?: string;
  positionId?: number;
};

export type TaskCreateResponse = {
  createdCount: number;
  taskIds: number[];
};

export type TaskDraftSaveRequest = {
  assigneeId: number;
  category?: TaskCategory;
  description?: string;
  oneLineComment?: string;
  title: string;
};

export type TaskDraft = {
  id: number;
  assigneeId: number;
  category: TaskCategory;
  description: string;
  oneLineComment: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskDetailMember = {
  id: number;
  name: string;
  branch: string | null;
  organizationName: string | null;
  roleType: MemberRole;
  positionName: string | null;
};

export type TaskDetailAttachment = {
  id: number;
  imageUrl: string;
  originalName: string | null;
  createdAt: string;
};

export type TaskCommentAttachment = {
  id: number;
  imageUrl: string;
  originalName: string | null;
  createdAt: string;
};

export type TaskComment = {
  id: number;
  taskId: number;
  creator: TaskDetailMember;
  content: string;
  oneLineComment: string | null;
  status: TaskStatus;
  attachments: TaskCommentAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type TaskCommentActivity = {
  id: number;
  taskId: number;
  taskTitle: string;
  assigneeName: string;
  assigneeRoleType: MemberRole;
  assigneePositionName: string | null;
  creatorName: string;
  creatorRoleType: MemberRole;
  creatorPositionName: string | null;
  oneLineComment: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskCommentCreateRequest = {
  attachments?: File[];
  content: string;
  oneLineComment?: string;
  status?: TaskStatus;
};

export type TaskDetail = {
  id: number;
  title: string;
  description: string;
  category: TaskCategory;
  oneLineComment: string | null;
  descriptionHighlightStart: number | null;
  descriptionHighlightEnd: number | null;
  descriptionHighlightExpiresAt: string | null;
  status: TaskStatus;
  assignee: TaskDetailMember;
  creator: TaskDetailMember;
  attachments: TaskDetailAttachment[];
  comments: TaskComment[];
  completedAt: string | null;
  reviewRequestedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskRecentWorkStatus = {
  taskId: number;
  taskTitle: string;
  taskCategory: TaskCategory;
  oneLineComment: string | null;
  taskStatus: TaskStatus;
  memberId: number;
  memberName: string;
  memberRole: MemberRole;
  memberPositionName: string | null;
  startedAt: string;
  submittedAt: string | null;
  attachmentPreviewUrls: string[];
  isNew: boolean;
};

export async function getTaskStatusSummary(): Promise<TaskStatusSummary> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/status-summary`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("업무 현황을 불러오지 못했습니다.");
  }

  return response.json() as Promise<TaskStatusSummary>;
}

export async function getTaskStatusSummaryByBranch(): Promise<TaskStatusSummaryByBranch[]> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/status-summary/branches`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("소속별 업무 현황을 불러오지 못했습니다.");
  }

  return response.json() as Promise<TaskStatusSummaryByBranch[]>;
}

export async function getTaskCategorySummary(
  filters: {
    statuses?: TaskStatus[];
  } = {}
): Promise<TaskCategorySummaryItem[]> {
  const params = new URLSearchParams();

  filters.statuses?.forEach((status) => {
    params.append("status", status);
  });

  const queryString = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/tasks/category-summary${queryString ? `?${queryString}` : ""}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("업무 종류별 현황을 불러오지 못했습니다.");
  }

  return response.json() as Promise<TaskCategorySummaryItem[]>;
}

type ApiErrorResponse = {
  message?: string | string[];
};

export async function createTask(
  accessToken: string,
  request: TaskCreateRequest
): Promise<TaskCreateResponse> {
  const formData = new FormData();
  formData.append("title", request.title);
  formData.append("description", request.description);
  formData.append("assigneeScope", request.assigneeScope);

  if (request.category) {
    formData.append("category", request.category);
  }

  if (request.oneLineComment) {
    formData.append("oneLineComment", request.oneLineComment);
  }

  if (request.assigneeId !== undefined) {
    formData.append("assigneeId", String(request.assigneeId));
  }

  if (request.branch) {
    formData.append("branch", request.branch);
  }

  if (request.positionId !== undefined) {
    formData.append("positionId", String(request.positionId));
  }

  request.attachments?.forEach((attachment) => {
    formData.append("attachments", attachment);
  });

  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: formData
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "업무를 등록하지 못했습니다.");
  }

  return response.json() as Promise<TaskCreateResponse>;
}

export async function getTaskDetail(accessToken: string, taskId: number): Promise<TaskDetail> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "업무 상세 정보를 불러오지 못했습니다.");
  }

  return response.json() as Promise<TaskDetail>;
}

export async function updateTaskDescription(
  accessToken: string,
  taskId: number,
  description: string
): Promise<TaskDetail> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/description`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ description })
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "프로젝트 내용을 수정하지 못했습니다.");
  }

  return response.json() as Promise<TaskDetail>;
}

export async function addTaskAttachments(
  accessToken: string,
  taskId: number,
  attachments: File[]
): Promise<TaskDetail> {
  const formData = new FormData();
  attachments.forEach((attachment) => {
    formData.append("attachments", attachment);
  });

  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/attachments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: formData
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "업무 사진을 첨부하지 못했습니다.");
  }

  return response.json() as Promise<TaskDetail>;
}

export async function getTaskDrafts(accessToken: string): Promise<TaskDraft[]> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/drafts`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "임시저장 업무를 불러오지 못했습니다.");
  }

  return response.json() as Promise<TaskDraft[]>;
}

export async function createTaskDraft(
  accessToken: string,
  request: TaskDraftSaveRequest
): Promise<TaskDraft> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/drafts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "업무를 임시저장하지 못했습니다.");
  }

  return response.json() as Promise<TaskDraft>;
}

export async function updateTaskDraft(
  accessToken: string,
  draftId: number,
  request: TaskDraftSaveRequest
): Promise<TaskDraft> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/drafts/${draftId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "임시저장 업무를 수정하지 못했습니다.");
  }

  return response.json() as Promise<TaskDraft>;
}

export async function publishTaskDraft(
  accessToken: string,
  draftId: number
): Promise<TaskCreateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/drafts/${draftId}/publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "임시저장 업무를 등록하지 못했습니다.");
  }

  return response.json() as Promise<TaskCreateResponse>;
}

export async function createTaskComment(
  accessToken: string,
  taskId: number,
  request: TaskCommentCreateRequest
): Promise<TaskComment> {
  const formData = new FormData();
  formData.append("content", request.content);

  if (request.oneLineComment) {
    formData.append("oneLineComment", request.oneLineComment);
  }

  if (request.status) {
    formData.append("status", request.status);
  }

  request.attachments?.forEach((attachment) => {
    formData.append("attachments", attachment);
  });

  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: formData
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "코멘트를 등록하지 못했습니다.");
  }

  return response.json() as Promise<TaskComment>;
}

export async function getTaskCommentActivities(
  accessToken: string,
  limit = 100
): Promise<TaskCommentActivity[]> {
  const response = await fetch(`${API_BASE_URL}/api/task-comments?limit=${limit}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "활동내역을 불러오지 못했습니다.");
  }

  return response.json() as Promise<TaskCommentActivity[]>;
}

export async function getTaskRecentWorkStatus(
  accessToken: string,
  filters: {
    category?: TaskCategory;
    sortOrder?: "LATEST" | "OLDEST";
    statuses?: TaskStatus[];
  } = {}
): Promise<TaskRecentWorkStatus[]> {
  const params = new URLSearchParams();

  filters.statuses?.forEach((status) => {
    params.append("status", status);
  });

  if (filters.sortOrder) {
    params.set("sortOrder", filters.sortOrder);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  const queryString = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/tasks/recent-work-status${queryString ? `?${queryString}` : ""}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "최근 작업 근황을 불러오지 못했습니다.");
  }

  return response.json() as Promise<TaskRecentWorkStatus[]>;
}

export async function getTaskAllWorkStatus(
  accessToken: string,
  filters: {
    category?: TaskCategory;
    sortOrder?: "LATEST" | "OLDEST";
    statuses?: TaskStatus[];
  } = {}
): Promise<TaskRecentWorkStatus[]> {
  const params = new URLSearchParams();

  filters.statuses?.forEach((status) => {
    params.append("status", status);
  });

  if (filters.sortOrder) {
    params.set("sortOrder", filters.sortOrder);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  const queryString = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/tasks/all-work-status${queryString ? `?${queryString}` : ""}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "전체 업무를 불러오지 못했습니다.");
  }

  return response.json() as Promise<TaskRecentWorkStatus[]>;
}
