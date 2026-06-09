import { IsOptional, IsString } from "class-validator";
import { TaskCommentAttachment } from "../entity/task-comment-attachment.entity";

export class TaskCommentAttachmentCreateRequest {
  @IsString({ message: "첨부 사진 URL은 문자열이어야 합니다." })
  imageUrl: string;

  @IsOptional()
  @IsString({ message: "첨부 사진 원본명은 문자열이어야 합니다." })
  originalName?: string;

  toEntity(taskCommentId: number): TaskCommentAttachment {
    const attachment = new TaskCommentAttachment();
    attachment.taskCommentId = taskCommentId;
    attachment.imageUrl = this.imageUrl;
    attachment.originalName = this.originalName ?? null;

    return attachment;
  }
}
