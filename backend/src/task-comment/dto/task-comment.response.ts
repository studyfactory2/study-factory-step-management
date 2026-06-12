import { TaskStatus } from "../../task/enum/task-status.enum";
import { MemberRole } from "../../member/enum/member-role.enum";

export class TaskCommentCreatorResponse {
  id: number;
  name: string;
  branch: string | null;
  roleType: MemberRole;
  positionName: string | null;
}

export class TaskCommentAttachmentResponse {
  id: number;
  imageUrl: string;
  originalName: string | null;
  createdAt: Date;
}

export class TaskCommentResponse {
  id: number;
  taskId: number;
  creator: TaskCommentCreatorResponse;
  content: string;
  oneLineComment: string | null;
  status: TaskStatus;
  attachments: TaskCommentAttachmentResponse[];
  createdAt: Date;
  updatedAt: Date;
}
