import { Type } from "class-transformer";
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { TaskStatus } from "../../task/enum/task-status.enum";
import { TaskComment } from "../entity/task-comment.entity";
import { TaskCommentAttachmentCreateRequest } from "./task-comment-attachment-create.request";

export class TaskCommentCreateRequest {
  @IsString({ message: "코멘트 내용은 문자열이어야 합니다." })
  content: string;

  @IsOptional()
  @IsString({ message: "한 줄 말은 문자열이어야 합니다." })
  oneLineComment?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: "유효하지 않은 업무 상태입니다." })
  status?: TaskStatus;

  @IsOptional()
  @IsArray({ message: "코멘트 첨부 사진 목록은 배열이어야 합니다." })
  @ValidateNested({ each: true })
  @Type(() => TaskCommentAttachmentCreateRequest)
  attachments?: TaskCommentAttachmentCreateRequest[];

  toEntity(taskId: number, createdBy: number): TaskComment {
    const comment = new TaskComment();
    comment.taskId = taskId;
    comment.createdBy = createdBy;
    comment.content = this.content;
    comment.oneLineComment = this.oneLineComment ?? null;

    return comment;
  }
}
