import { IsOptional, IsString } from "class-validator";
import { TaskAttachment } from "../entity/task-attachment.entity";

export class TaskAttachmentCreateRequest {
  @IsString({ message: "첨부 이미지 주소는 문자열이어야 합니다." })
  imageUrl: string;

  @IsOptional()
  @IsString({ message: "첨부 파일명은 문자열이어야 합니다." })
  originalName?: string;

  toEntity(taskId: number): TaskAttachment {
    const attachment = new TaskAttachment();
    attachment.taskId = taskId;
    attachment.imageUrl = this.imageUrl;
    attachment.originalName = this.originalName ?? null;

    return attachment;
  }
}
