import { MemberRole } from "../../member/enum/member-role.enum";
import { TaskStatus } from "../enum/task-status.enum";

export class TaskDetailMemberResponse {
  id: number;
  name: string;
  branch: string | null;
  roleType: MemberRole;
  positionName: string | null;
}

export class TaskDetailAttachmentResponse {
  id: number;
  imageUrl: string;
  originalName: string | null;
  createdAt: Date;
}

export class TaskDetailResponse {
  id: number;
  title: string;
  description: string;
  oneLineComment: string | null;
  status: TaskStatus;
  assignee: TaskDetailMemberResponse;
  creator: TaskDetailMemberResponse;
  attachments: TaskDetailAttachmentResponse[];
  completedAt: Date | null;
  reviewRequestedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
