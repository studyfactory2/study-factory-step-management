import { MemberRole } from "../../member/enum/member-role.enum";
import { TaskCategory } from "../enum/task-category.enum";
import { TaskStatus } from "../enum/task-status.enum";

export class TaskRecentWorkStatusResponse {
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
  lastActorId: number;
  memberId: number;
  memberName: string;
  memberRole: MemberRole;
  memberPositionName: string | null;
  startedAt: Date;
  submittedAt: Date | null;
  attachmentPreviewUrls: string[];
  isNew: boolean;
}

export class TaskCategorySummaryItemResponse {
  category: TaskCategory;
  count: number;
}
