import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";
import { Task } from "../entity/task.entity";
import { TaskAssigneeScope } from "../enum/task-assignee-scope.enum";
import { TaskStatus } from "../enum/task-status.enum";
import { TaskAttachmentCreateRequest } from "./task-attachment-create.request";

export class TaskCreateRequest {
  @IsString({ message: "업무 제목은 문자열이어야 합니다." })
  title: string;

  @IsString({ message: "업무 설명은 문자열이어야 합니다." })
  description: string;

  @IsEnum(TaskAssigneeScope, { message: "유효하지 않은 담당자 지정 방식입니다." })
  assigneeScope: TaskAssigneeScope;

  @IsOptional()
  @IsNumber({}, { message: "담당자 ID는 숫자여야 합니다." })
  assigneeId?: number;

  @IsOptional()
  @IsDateString({}, { message: "마감일은 날짜 형식이어야 합니다." })
  dueAt?: string;

  @IsOptional()
  @IsArray({ message: "첨부 사진 목록은 배열이어야 합니다." })
  @ValidateNested({ each: true })
  @Type(() => TaskAttachmentCreateRequest)
  attachments?: TaskAttachmentCreateRequest[];

  toEntity(assigneeId: number, createdBy: number): Task {
    const task = new Task();
    task.title = this.title;
    task.description = this.description;
    task.status = TaskStatus.REGISTERED;
    task.assigneeId = assigneeId;
    task.createdBy = createdBy;
    task.dueAt = this.dueAt ? new Date(this.dueAt) : null;
    task.completedAt = null;
    task.isDraft = false;

    return task;
  }
}
