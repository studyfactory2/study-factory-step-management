import { MemberRole } from "../../member/enum/member-role.enum";
import { TaskStatus } from "../../task/enum/task-status.enum";

export class TaskCommentActivityResponse {
  id: number;
  taskId: number;
  taskTitle: string;
  assigneeName: string;
  assigneeRoleType: MemberRole;
  assigneePositionName: string | null;
  oneLineComment: string | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}
