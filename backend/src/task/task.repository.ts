import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { TaskAttachment } from "./entity/task-attachment.entity";
import { Task } from "./entity/task.entity";
import { TaskStatus } from "./enum/task-status.enum";

export type TaskCountRow = {
  assigneeId: number;
  status: TaskStatus;
  count: string;
};

@Injectable()
export class TaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskAttachment)
    private readonly taskAttachmentRepository: Repository<TaskAttachment>
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

  async findActiveCountRowsByAssigneeAndStatus(statuses: TaskStatus[]): Promise<TaskCountRow[]> {
    return this.taskRepository
      .createQueryBuilder("task")
      .select("task.assigneeId", "assigneeId")
      .addSelect("task.status", "status")
      .addSelect("COUNT(task.id)", "count")
      .where("task.isDraft = false")
      .andWhere("task.status IN (:...statuses)", { statuses })
      .groupBy("task.assigneeId")
      .addGroupBy("task.status")
      .getRawMany<TaskCountRow>();
  }

  async findRecentReviewRequested(limit: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: {
        status: TaskStatus.REVIEW_REQUESTED,
        isDraft: false
      },
      relations: {
        assignee: true,
        attachments: true
      },
      order: {
        updatedAt: "DESC"
      },
      take: limit
    });
  }

  async saveAll(tasks: Task[]): Promise<Task[]> {
    return this.taskRepository.save(tasks);
  }

  async saveAttachments(attachments: TaskAttachment[]): Promise<TaskAttachment[]> {
    return this.taskAttachmentRepository.save(attachments);
  }
}
