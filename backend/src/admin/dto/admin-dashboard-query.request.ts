import { Transform } from "class-transformer";
import { IsArray, IsEnum, IsOptional } from "class-validator";
import { TaskCategory } from "../../task/enum/task-category.enum";
import { TaskStatus } from "../../task/enum/task-status.enum";
import { TaskSortOrder } from "../../task/enum/task-sort-order.enum";

export class AdminDashboardQueryRequest {
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

  @IsOptional()
  @IsEnum(TaskCategory)
  category?: TaskCategory;
}
