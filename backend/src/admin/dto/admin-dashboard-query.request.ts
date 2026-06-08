import { IsEnum, IsOptional } from "class-validator";
import { TaskStatus } from "../../task/enum/task-status.enum";
import { TaskSortOrder } from "../../task/enum/task-sort-order.enum";

export class AdminDashboardQueryRequest {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskSortOrder)
  sortOrder?: TaskSortOrder;
}
