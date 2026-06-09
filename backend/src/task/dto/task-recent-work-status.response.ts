import { MemberRole } from "../../member/enum/member-role.enum";
import { TaskStatus } from "../enum/task-status.enum";

export class TaskRecentWorkStatusResponse {
  taskId: number;
  taskTitle: string;
  oneLineComment: string | null;
  taskStatus: TaskStatus;
  memberId: number;
  memberName: string;
  memberRole: MemberRole;
  memberPositionName: string | null;
  startedAt: Date;
  submittedAt: Date | null;
  attachmentPreviewUrls: string[];
}
