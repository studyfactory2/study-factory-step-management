const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type TaskStatusSummary = {
  registered: number;
  inProgress: number;
  reviewRequested: number;
  completedThisMonth: number;
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
