import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { TaskAttachment } from "./entity/task-attachment.entity";
import { TaskReadStatus } from "./entity/task-read-status.entity";
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
  memberId?: number;
  sortOrder?: TaskSortOrder;
  statuses: TaskStatus[];
  viewerId?: number;
};

@Injectable()
export class TaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskAttachment)
    private readonly taskAttachmentRepository: Repository<TaskAttachment>,
    @InjectRepository(TaskReadStatus)
    private readonly taskReadStatusRepository: Repository<TaskReadStatus>
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
      .leftJoinAndSelect("assignee.positionInfo", "assigneePosition")
      .leftJoinAndSelect("task.attachments", "attachments")
      .leftJoinAndSelect("task.comments", "comments")
      .where("task.status IN (:...statuses)", { statuses: options.statuses })
      .andWhere("task.isDraft = false");

    if (options.viewerId) {
      queryBuilder.leftJoinAndSelect(
        "task.readStatuses",
        "readStatus",
        "readStatus.memberId = :viewerId",
        { viewerId: options.viewerId }
      );
    }

    if (options.memberId) {
      queryBuilder.andWhere("(task.assigneeId = :memberId OR task.createdBy = :memberId)", {
        memberId: options.memberId
      });
    }

    if (options.sortOrder === TaskSortOrder.LATEST) {
      queryBuilder.orderBy("task.updatedAt", "DESC");
    } else if (options.sortOrder === TaskSortOrder.OLDEST) {
      queryBuilder.orderBy("task.updatedAt", "ASC");
    } else {
      queryBuilder.orderBy("task.updatedAt", "DESC");
    }

    queryBuilder.addOrderBy("comments.updatedAt", "DESC");

    return queryBuilder.take(options.limit).getMany();
  }

  async findDetailById(id: number): Promise<Task | null> {
    return this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.assignee", "assignee")
      .leftJoinAndSelect("assignee.positionInfo", "assigneePosition")
      .leftJoinAndSelect("task.creator", "creator")
      .leftJoinAndSelect("creator.positionInfo", "creatorPosition")
      .leftJoinAndSelect("task.attachments", "attachments")
      .leftJoinAndSelect("task.comments", "comments")
      .leftJoinAndSelect("comments.attachments", "commentAttachments")
      .where("task.id = :id", { id })
      .andWhere("task.isDraft = false")
      .orderBy("attachments.createdAt", "ASC")
      .addOrderBy("comments.createdAt", "ASC")
      .addOrderBy("commentAttachments.createdAt", "ASC")
      .getOne();
  }

  async findPublishedById(id: number): Promise<Task | null> {
    return this.taskRepository.findOne({
      where: {
        id,
        isDraft: false
      }
    });
  }

  async findDraftsByCreator(createdBy: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: {
        createdBy,
        isDraft: true
      },
      order: {
        createdAt: "ASC"
      }
    });
  }

  async findDraftByIdAndCreator(id: number, createdBy: number): Promise<Task | null> {
    return this.taskRepository.findOne({
      where: {
        id,
        createdBy,
        isDraft: true
      }
    });
  }

  async save(task: Task): Promise<Task> {
    return this.taskRepository.save(task);
  }

  async saveAll(tasks: Task[]): Promise<Task[]> {
    return this.taskRepository.save(tasks);
  }

  async saveAttachments(attachments: TaskAttachment[]): Promise<TaskAttachment[]> {
    return this.taskAttachmentRepository.save(attachments);
  }

  async markTaskViewed(taskId: number, memberId: number, viewedAt = new Date()): Promise<void> {
    await this.taskReadStatusRepository.upsert(
      {
        taskId,
        memberId,
        lastViewedAt: viewedAt
      },
      ["taskId", "memberId"]
    );
  }

  async markTasksViewed(taskIds: number[], memberId: number, viewedAt = new Date()): Promise<void> {
    if (taskIds.length === 0) {
      return;
    }

    await this.taskReadStatusRepository.upsert(
      taskIds.map((taskId) => ({
        taskId,
        memberId,
        lastViewedAt: viewedAt
      })),
      ["taskId", "memberId"]
    );
  }
}
