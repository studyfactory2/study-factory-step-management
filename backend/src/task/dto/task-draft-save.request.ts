import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Task } from "../entity/task.entity";
import { TaskCategory } from "../enum/task-category.enum";
import { TaskStatus } from "../enum/task-status.enum";

export class TaskDraftSaveRequest {
  @IsString({ message: "업무 제목은 문자열이어야 합니다." })
  title: string;

  @IsOptional()
  @IsString({ message: "업무 설명은 문자열이어야 합니다." })
  description?: string;

  @IsOptional()
  @IsEnum(TaskCategory, { message: "유효하지 않은 업무 카테고리입니다." })
  category?: TaskCategory;

  @IsOptional()
  @IsString({ message: "한줄멘트는 문자열이어야 합니다." })
  oneLineComment?: string;

  @IsNumber({}, { message: "담당자 ID는 숫자여야 합니다." })
  assigneeId: number;

  toEntity(createdBy: number): Task {
    const task = new Task();
    task.title = this.title;
    task.description = this.description ?? "";
    task.category = this.category ?? TaskCategory.OPERATION;
    task.oneLineComment = this.oneLineComment?.trim() || null;
    task.descriptionHighlightStart = null;
    task.descriptionHighlightEnd = null;
    task.descriptionHighlightExpiresAt = null;
    task.status = TaskStatus.REGISTERED;
    task.assigneeId = this.assigneeId;
    task.createdBy = createdBy;
    task.completedAt = null;
    task.reviewRequestedAt = null;
    task.isDraft = true;

    return task;
  }
}
