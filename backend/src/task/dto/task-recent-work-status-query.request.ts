import { Transform } from "class-transformer";
import { IsArray, IsEnum, IsOptional } from "class-validator";
import { TaskSortOrder } from "../enum/task-sort-order.enum";
import { TaskStatus } from "../enum/task-status.enum";

export class TaskRecentWorkStatusQueryRequest {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) {
      return undefined;
    }

    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsEnum(TaskStatus, { each: true })
  status?: TaskStatus[];

  @IsOptional()
  @IsEnum(TaskSortOrder)
  sortOrder?: TaskSortOrder;
}
