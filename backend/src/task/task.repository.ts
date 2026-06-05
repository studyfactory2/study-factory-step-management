import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { Task } from "./entity/task.entity";
import { TaskStatus } from "./enum/task-status.enum";

@Injectable()
export class TaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>
  ) {}

  async countByStatus(status: TaskStatus): Promise<number> {
    return this.taskRepository.count({
      where: {
        status,
        isDraft: false
      }
    });
  }

  async countCompletedBetween(startAt: Date, endAt: Date): Promise<number> {
    return this.taskRepository.count({
      where: {
        status: TaskStatus.COMPLETED,
        completedAt: Between(startAt, endAt),
        isDraft: false
      }
    });
  }
}
