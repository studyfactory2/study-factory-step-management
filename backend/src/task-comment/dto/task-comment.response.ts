import { TaskStatus } from "../../task/enum/task-status.enum";

export class TaskCommentAttachmentResponse {
  id: number;
  imageUrl: string;
  originalName: string | null;
  createdAt: Date;
}

export class TaskCommentResponse {
  id: number;
  taskId: number;
  content: string;
  oneLineComment: string | null;
  status: TaskStatus;
  attachments: TaskCommentAttachmentResponse[];
  createdAt: Date;
  updatedAt: Date;
}
