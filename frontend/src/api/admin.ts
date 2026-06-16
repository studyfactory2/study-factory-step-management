import type { TaskCategory } from "@/api/task";
import type { MemberRole, TaskStatus } from "@/types/domain";
import { handleUnauthorizedResponse } from "@/api/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const ADMIN_DASHBOARD_CACHE_TTL_MS = 1000 * 30;
const ADMIN_DASHBOARD_CACHE_KEY_PREFIX = "study-factory:admin-dashboard";

export type AdminDashboardTaskCounts = {
  registered: number;
  inProgress: number;
  reviewRequested: number;
};

export type AdminDashboardCurrentMember = {
  id: number;
  name: string;
  roleType: MemberRole;
  positionName: string | null;
  branch: string | null;
};

export type AdminDashboardEmployee = {
  id: number;
  name: string;
  roleType: MemberRole;
  positionName: string | null;
  branch: string | null;
  highestTaskStatus: Exclude<TaskStatus, "COMPLETED"> | null;
  taskCounts: AdminDashboardTaskCounts;
};

export type AdminDashboardBranchGroup = {
  branch: string;
  memberCount: number;
};

export type AdminDashboardRecentOutput = {
  taskId: number;
  taskTitle: string;
  taskCategory: TaskCategory;
  oneLineComment: string | null;
  taskStatus: TaskStatus;
  creatorId?: number;
  creatorName?: string;
  creatorRole?: MemberRole;
  creatorPositionName?: string | null;
  creatorOrganizationName?: string | null;
  lastActorId?: number;
  memberId: number;
  memberName: string;
  memberRole: MemberRole;
  memberPositionName: string | null;
  startedAt: string;
  updatedAt?: string;
  submittedAt: string | null;
  attachmentPreviewUrls: string[];
  isNew: boolean;
};

export type AdminDashboard = {
  currentMember: AdminDashboardCurrentMember;
  employees: AdminDashboardEmployee[];
  branchGroups: AdminDashboardBranchGroup[];
  recentOutputs: AdminDashboardRecentOutput[];
};

export type AdminDashboardSortOrder = "LATEST" | "OLDEST";

export type AdminDashboardFilters = {
  category?: TaskCategory;
  sortOrder?: AdminDashboardSortOrder;
  statuses?: TaskStatus[];
};

type ApiErrorResponse = {
  message?: string | string[];
};

type AdminDashboardCache = {
  dashboard: AdminDashboard;
  savedAt: number;
};

function getAdminDashboardViewerCacheKey(accessToken: string) {
  return accessToken.slice(-24);
}

function getAdminDashboardCacheKey(accessToken: string, filters: AdminDashboardFilters = {}) {
  const statusKey = filters.statuses?.length
    ? [...filters.statuses].sort().join(",")
    : "ALL";
  const sortOrderKey = filters.sortOrder ?? "LATEST";
  const categoryKey = filters.category ?? "ALL";

  return `${ADMIN_DASHBOARD_CACHE_KEY_PREFIX}:${getAdminDashboardViewerCacheKey(accessToken)}:${categoryKey}:${sortOrderKey}:${statusKey}`;
}

export function readAdminDashboardCache(accessToken: string, filters: AdminDashboardFilters = {}): AdminDashboard | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const cacheKey = getAdminDashboardCacheKey(accessToken, filters);
    const cachedValue = window.localStorage.getItem(cacheKey);
    if (!cachedValue) {
      return null;
    }

    const cache = JSON.parse(cachedValue) as AdminDashboardCache;
    if (!cache.dashboard || Date.now() - cache.savedAt > ADMIN_DASHBOARD_CACHE_TTL_MS) {
      window.localStorage.removeItem(cacheKey);
      return null;
    }

    return cache.dashboard;
  } catch {
    window.localStorage.removeItem(getAdminDashboardCacheKey(accessToken, filters));
    return null;
  }
}

function saveAdminDashboardCache(accessToken: string, filters: AdminDashboardFilters = {}, dashboard: AdminDashboard) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getAdminDashboardCacheKey(accessToken, filters),
    JSON.stringify({
      dashboard,
      savedAt: Date.now()
    } satisfies AdminDashboardCache)
  );
}

export async function getAdminDashboard(
  accessToken: string,
  filters: AdminDashboardFilters = {}
): Promise<AdminDashboard> {
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
  const response = await fetch(`${API_BASE_URL}/api/admin/dashboard${queryString ? `?${queryString}` : ""}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "관리자 대시보드를 불러오지 못했습니다.");
  }

  const dashboard = await response.json() as AdminDashboard;
  saveAdminDashboardCache(accessToken, filters, dashboard);

  return dashboard;
}
