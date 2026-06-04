import { TaskStatus, TaskUpdateType } from "@prisma/client";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";

export class CreateTaskUpdateInput {
  @IsString()
  authorId: string;

  @IsString()
  @Length(1, 2000)
  content: string;

  @IsEnum(TaskUpdateType)
  @IsOptional()
  type?: TaskUpdateType;

  @IsEnum(TaskStatus)
  @IsOptional()
  previousStatus?: TaskStatus;

  @IsEnum(TaskStatus)
  @IsOptional()
  nextStatus?: TaskStatus;
}
