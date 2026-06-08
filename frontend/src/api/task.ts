import type { MemberRole, TaskStatus } from "@/types/domain";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type TaskStatusSummary = {
  registered: number;
  inProgress: number;
  reviewRequested: number;
  completedThisMonth: number;
};

export type TaskAssigneeScope = "SINGLE" | "ALL";

export type TaskCreateRequest = {
  title: string;
  description: string;
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
  description?: string;
  title: string;
};

export type TaskDraft = {
  id: number;
  assigneeId: number;
  description: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskDetailMember = {
  id: number;
  name: string;
  branch: string | null;
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
  oneLineComment: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskCommentCreateRequest = {
  content: string;
  oneLineComment?: string;
  status?: TaskStatus;
};

export type TaskDetail = {
  id: number;
  title: string;
  description: string;
  descriptionHighlightStart: number | null;
  descriptionHighlightEnd: number | null;
  descriptionHighlightExpiresAt: string | null;
  oneLineComment: string | null;
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

export async function getTaskStatusSummary(): Promise<TaskStatusSummary> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/status-summary`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("업무 현황을 불러오지 못했습니다.");
  }

  return response.json() as Promise<TaskStatusSummary>;
}

type ApiErrorResponse = {
  message?: string | string[];
};

export async function createTask(
  accessToken: string,
  request: TaskCreateRequest
): Promise<TaskCreateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
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
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "프로젝트 내용을 수정하지 못했습니다.");
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
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
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
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "활동내역을 불러오지 못했습니다.");
  }

  return response.json() as Promise<TaskCommentActivity[]>;
}
