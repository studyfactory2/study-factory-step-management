import { MemberRole } from "../../member/enum/member-role.enum";
import { TaskCategory } from "../../task/enum/task-category.enum";
import { TaskStatus } from "../../task/enum/task-status.enum";

export class AdminDashboardCurrentMemberResponse {
  id: number;
  name: string;
  roleType: MemberRole;
  positionName: string | null;
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
  positionName: string | null;
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
  taskCategory: TaskCategory;
  oneLineComment: string | null;
  taskStatus: TaskStatus;
  creatorId: number;
  creatorName: string;
  creatorRole: MemberRole;
  creatorPositionName: string | null;
  creatorOrganizationName: string | null;
  memberId: number;
  memberName: string;
  memberRole: MemberRole;
  memberPositionName: string | null;
  startedAt: Date;
  updatedAt: Date;
  submittedAt: Date | null;
  attachmentPreviewUrls: string[];
  isNew: boolean;
}

export class AdminDashboardResponse {
  currentMember: AdminDashboardCurrentMemberResponse;
  employees: AdminDashboardEmployeeResponse[];
  branchGroups: AdminDashboardBranchGroupResponse[];
  recentOutputs: AdminDashboardRecentOutputResponse[];
}
