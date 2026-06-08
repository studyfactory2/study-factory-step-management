import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { TaskAttachment } from "./entity/task-attachment.entity";
import { Task } from "./entity/task.entity";
import { TaskSortOrder } from "./enum/task-sort-order.enum";
import { TaskStatus } from "./enum/task-status.enum";

export type TaskCountRow = {
  assigneeId: number;
  status: TaskStatus;
  count: string;
};

type FindRecentWorkStatusOptions = {
  limit: number;
  sortOrder?: TaskSortOrder;
  status: TaskStatus;
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

  async findRecentWorkStatus(options: FindRecentWorkStatusOptions): Promise<Task[]> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.assignee", "assignee")
      .leftJoinAndSelect("task.attachments", "attachments")
      .where("task.status = :status", { status: options.status })
      .andWhere("task.isDraft = false");

    if (options.sortOrder === TaskSortOrder.LATEST) {
      queryBuilder.orderBy("task.updatedAt", "DESC");
    } else if (options.sortOrder === TaskSortOrder.OLDEST) {
      queryBuilder.orderBy("task.updatedAt", "ASC");
    } else if (options.status === TaskStatus.REVIEW_REQUESTED) {
      queryBuilder
        .orderBy("task.reviewRequestedAt", "DESC", "NULLS LAST")
        .addOrderBy("task.updatedAt", "DESC");
    } else {
      queryBuilder.orderBy("task.updatedAt", "DESC");
    }

    return queryBuilder.take(options.limit).getMany();
  }

  async saveAll(tasks: Task[]): Promise<Task[]> {
    return this.taskRepository.save(tasks);
  }

  async saveAttachments(attachments: TaskAttachment[]): Promise<TaskAttachment[]> {
    return this.taskAttachmentRepository.save(attachments);
  }
}
