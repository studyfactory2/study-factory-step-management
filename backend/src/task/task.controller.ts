import { Controller, Get } from "@nestjs/common";
import { TaskService } from "./task.service";

@Controller("tasks")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get("status-summary")
  async getStatusSummary() {
    return this.taskService.getStatusSummary();
  }
}
