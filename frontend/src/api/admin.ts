import type { MemberRole, TaskStatus } from "@/types/domain";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type AdminDashboardTaskCounts = {
  registered: number;
  inProgress: number;
  reviewRequested: number;
};

export type AdminDashboardCurrentMember = {
  id: number;
  name: string;
  roleType: MemberRole;
  branch: string | null;
};

export type AdminDashboardEmployee = {
  id: number;
  name: string;
  roleType: MemberRole;
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
  memberId: number;
  memberName: string;
  memberRole: MemberRole;
  startedAt: string;
  submittedAt: string;
  attachmentPreviewUrls: string[];
};

export type AdminDashboard = {
  currentMember: AdminDashboardCurrentMember;
  employees: AdminDashboardEmployee[];
  branchGroups: AdminDashboardBranchGroup[];
  recentOutputs: AdminDashboardRecentOutput[];
};

type ApiErrorResponse = {
  message?: string | string[];
};

export async function getAdminDashboard(accessToken: string): Promise<AdminDashboard> {
  const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "관리자 대시보드를 불러오지 못했습니다.");
  }

  return response.json() as Promise<AdminDashboard>;
}
