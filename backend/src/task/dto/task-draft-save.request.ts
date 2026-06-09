import { IsNumber, IsOptional, IsString } from "class-validator";
import { Task } from "../entity/task.entity";
import { TaskStatus } from "../enum/task-status.enum";

export class TaskDraftSaveRequest {
  @IsString({ message: "업무 제목은 문자열이어야 합니다." })
  title: string;

  @IsOptional()
  @IsString({ message: "업무 설명은 문자열이어야 합니다." })
  description?: string;

  @IsNumber({}, { message: "담당자 ID는 숫자여야 합니다." })
  assigneeId: number;

  toEntity(createdBy: number): Task {
    const task = new Task();
    task.title = this.title;
    task.description = this.description ?? "";
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
