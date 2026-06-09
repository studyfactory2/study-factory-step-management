import { MemberRole } from "../../member/enum/member-role.enum";
import { TaskStatus } from "../../task/enum/task-status.enum";

export class HelpRequestAttachmentResponse {
  id: number;
  imageUrl: string;
  originalName: string | null;
  createdAt: Date;
}

export class HelpRequestReceivedResponse {
  id: number;
  requesterId: number;
  requesterName: string;
  requesterRoleType: MemberRole;
  requesterPositionName: string | null;
  taskId: number;
  taskTitle: string;
  taskStatus: TaskStatus;
  oneLineComment: string;
  attachments: HelpRequestAttachmentResponse[];
  requestedAt: Date;
}
