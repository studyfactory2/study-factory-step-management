import { TaskStatus } from "../task/enum/task-status.enum";

export const TASK_DASHBOARD_CACHE_TTL_SECONDS = 15;
export const TASK_DASHBOARD_CACHE_KEY_PREFIX = "task-dashboard";

export function getTaskCategorySummaryCacheKey(
  statuses?: TaskStatus[],
  assigneeId?: number
): string {
  const statusKey = statuses?.length
    ? [...statuses].sort().join(",")
    : "ALL";
  const assigneeKey = assigneeId ? `assignee-${assigneeId}` : "all-assignees";

  return `${TASK_DASHBOARD_CACHE_KEY_PREFIX}:category-summary:${assigneeKey}:${statusKey}`;
}

export const TASK_DASHBOARD_CACHE_KEYS = {
  categorySummaryPattern: `${TASK_DASHBOARD_CACHE_KEY_PREFIX}:category-summary`
} as const;
