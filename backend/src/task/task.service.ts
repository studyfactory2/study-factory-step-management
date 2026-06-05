import { Injectable } from "@nestjs/common";
import { TaskStatusSummaryResponse } from "./dto/task-status-summary.response";
import { TaskStatus } from "./enum/task-status.enum";
import { TaskRepository } from "./task.repository";

@Injectable()
export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async getStatusSummary(): Promise<TaskStatusSummaryResponse> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [registered, inProgress, reviewRequested, completedThisMonth] = await Promise.all([
      this.taskRepository.countByStatus(TaskStatus.REGISTERED),
      this.taskRepository.countByStatus(TaskStatus.IN_PROGRESS),
      this.taskRepository.countByStatus(TaskStatus.REVIEW_REQUESTED),
      this.taskRepository.countCompletedBetween(startOfMonth, endOfMonth)
    ]);

    return {
      registered,
      inProgress,
      reviewRequested,
      completedThisMonth
    };
  }
}
