import { MemberRole } from "../../member/enum/member-role.enum";
import { TaskStatus } from "../../task/enum/task-status.enum";

export class AdminDashboardCurrentMemberResponse {
  id: number;
  name: string;
  roleType: MemberRole;
  branch: string | null;
}

export class AdminDashboardTaskCountsResponse {
  registered: number;
  inProgress: number;
  reviewRequested: number;
}

export class AdminDashboardEmployeeResponse {
  id: number;
  name: string;
  roleType: MemberRole;
  branch: string | null;
  highestTaskStatus: Exclude<TaskStatus, TaskStatus.COMPLETED> | null;
  taskCounts: AdminDashboardTaskCountsResponse;
}

export class AdminDashboardBranchGroupResponse {
  branch: string;
  memberCount: number;
}

export class AdminBranchStaffCountResponse {
  branch: string;
  memberCount: number;
}

export class AdminDashboardRecentOutputResponse {
  taskId: number;
  taskTitle: string;
  taskStatus: TaskStatus;
  memberId: number;
  memberName: string;
  memberRole: MemberRole;
  startedAt: Date;
  submittedAt: Date | null;
  attachmentPreviewUrls: string[];
}

export class AdminDashboardResponse {
  currentMember: AdminDashboardCurrentMemberResponse;
  employees: AdminDashboardEmployeeResponse[];
  branchGroups: AdminDashboardBranchGroupResponse[];
  recentOutputs: AdminDashboardRecentOutputResponse[];
}
