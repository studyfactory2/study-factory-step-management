import { Type } from "class-transformer";
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
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

  @ValidateIf((request: TaskCreateRequest) => request.assigneeScope === TaskAssigneeScope.SINGLE)
  @IsDefined({ message: "단일 담당자 업무 등록에는 담당자 ID가 필요합니다." })
  @Type(() => Number)
  @IsNumber({}, { message: "담당자 ID는 숫자여야 합니다." })
  assigneeId?: number;

  @IsOptional()
  @IsString({ message: "지점은 문자열이어야 합니다." })
  branch?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "직위 ID는 숫자여야 합니다." })
  positionId?: number;

  @IsOptional()
  @IsArray({ message: "첨부 사진 목록은 배열이어야 합니다." })
  @ValidateNested({ each: true })
  @Type(() => TaskAttachmentCreateRequest)
  attachments?: TaskAttachmentCreateRequest[];

  toEntity(assigneeId: number, createdBy: number): Task {
    const task = new Task();
    task.title = this.title;
    task.description = this.description;
    task.descriptionHighlightStart = null;
    task.descriptionHighlightEnd = null;
    task.descriptionHighlightExpiresAt = null;
    task.status = TaskStatus.REGISTERED;
    task.assigneeId = assigneeId;
    task.createdBy = createdBy;
    task.completedAt = null;
    task.isDraft = false;

    return task;
  }
}
