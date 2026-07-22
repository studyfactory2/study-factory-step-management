import { IsEnum, IsOptional, IsString } from "class-validator";
import { TaskStatus } from "../../task/enum/task-status.enum";

export class TaskCommentUpdateRequest {
  @IsString({ message: "코멘트 내용은 문자열이어야 합니다." })
  content: string;

  @IsOptional()
  @IsString({ message: "한 줄 말은 문자열이어야 합니다." })
  oneLineComment?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: "유효하지 않은 업무 상태입니다." })
  status?: TaskStatus;
}
