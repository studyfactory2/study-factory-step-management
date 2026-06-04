import { TaskPriority, TaskStatus } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

export class CreateTaskInput {
  @IsString()
  @Length(1, 100)
  title: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  assigneeId: string;

  @IsString()
  createdById: string;

  @IsOptional()
  @IsString()
  reviewerId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  initialNote?: string;
}
