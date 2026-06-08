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
