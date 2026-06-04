import { TaskStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";

export class UpdateTaskStatusInput {
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsString()
  authorId: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  note?: string;
}
