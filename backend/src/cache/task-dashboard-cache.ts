import { TaskStatus } from "../task/enum/task-status.enum";

export const TASK_DASHBOARD_CACHE_TTL_SECONDS = 15;
export const TASK_DASHBOARD_CACHE_KEY_PREFIX = "task-dashboard";

export function getTaskCategorySummaryCacheKey(statuses?: TaskStatus[]): string {
  const statusKey = statuses?.length
    ? [...statuses].sort().join(",")
    : "ALL";

  return `${TASK_DASHBOARD_CACHE_KEY_PREFIX}:category-summary:${statusKey}`;
}

export const TASK_DASHBOARD_CACHE_KEYS = {
  categorySummaryPattern: `${TASK_DASHBOARD_CACHE_KEY_PREFIX}:category-summary`
} as const;
