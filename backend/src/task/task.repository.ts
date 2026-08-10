import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { TaskAttachment } from "./entity/task-attachment.entity";
import { TaskReadStatus } from "./entity/task-read-status.entity";
import { Task } from "./entity/task.entity";
import { TaskCategory } from "./enum/task-category.enum";
import { TaskSortOrder } from "./enum/task-sort-order.enum";
import { TaskStatus } from "./enum/task-status.enum";

export type TaskCountRow = {
  assigneeId: number;
  status: TaskStatus;
  count: string;
};

export type TaskCategoryCountRow = {
  category: TaskCategory;
  count: string;
};

export type TaskStatusSummaryByBranchRow = {
  branch: string | null;
  registered: string;
  registeredToday: string;
  inProgress: string;
  inProgressThisWeek: string;
  inProgressLastWeek: string;
  reviewRequested: string;
  reviewRequestedThisWeek: string;
  reviewRequestedLastWeek: string;
  completedThisMonth: string;
};

type FindRecentWorkStatusOptions = {
  category?: TaskCategory;
  limit?: number;
  memberId?: number;
  prioritizeIncomplete?: boolean;
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

  async countByStatusAndCreatedAtBetween(
    status: TaskStatus,
    startAt: Date,
    endAt: Date
  ): Promise<number> {
    return this.taskRepository.count({
      where: {
        status,
        createdAt: Between(startAt, endAt),
        isDraft: false
      }
    });
  }

  async countByStatusAndUpdatedAtBetween(
    status: TaskStatus,
    startAt: Date,
    endAt: Date
  ): Promise<number> {
    return this.taskRepository.count({
      where: {
        status,
        updatedAt: Between(startAt, endAt),
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

  async findStatusSummaryRowsByAssigneeOrganization({
    endOfMonth,
    now,
    startOfLastWeek,
    startOfMonth,
    startOfThisWeek,
    startOfToday,
    startOfTomorrow
  }: {
    endOfMonth: Date;
    now: Date;
    startOfLastWeek: Date;
    startOfMonth: Date;
    startOfThisWeek: Date;
    startOfToday: Date;
    startOfTomorrow: Date;
  }): Promise<TaskStatusSummaryByBranchRow[]> {
    return this.taskRepository
      .createQueryBuilder("task")
      .innerJoin("task.assignee", "assignee")
      .leftJoin("assignee.organization", "organization")
      .select("organization.name", "branch")
      .addSelect("COUNT(*) FILTER (WHERE task.status = :registered)", "registered")
      .addSelect(
        "COUNT(*) FILTER (WHERE task.status = :registered AND task.createdAt >= :startOfToday AND task.createdAt < :startOfTomorrow)",
        "registeredToday"
      )
      .addSelect("COUNT(*) FILTER (WHERE task.status = :inProgress)", "inProgress")
      .addSelect(
        "COUNT(*) FILTER (WHERE task.status = :inProgress AND task.updatedAt >= :startOfThisWeek AND task.updatedAt < :now)",
        "inProgressThisWeek"
      )
      .addSelect(
        "COUNT(*) FILTER (WHERE task.status = :inProgress AND task.updatedAt >= :startOfLastWeek AND task.updatedAt < :startOfThisWeek)",
        "inProgressLastWeek"
      )
      .addSelect("COUNT(*) FILTER (WHERE task.status = :reviewRequested)", "reviewRequested")
      .addSelect(
        "COUNT(*) FILTER (WHERE task.status = :reviewRequested AND task.updatedAt >= :startOfThisWeek AND task.updatedAt < :now)",
        "reviewRequestedThisWeek"
      )
      .addSelect(
        "COUNT(*) FILTER (WHERE task.status = :reviewRequested AND task.updatedAt >= :startOfLastWeek AND task.updatedAt < :startOfThisWeek)",
        "reviewRequestedLastWeek"
      )
      .addSelect(
        "COUNT(*) FILTER (WHERE task.status = :completed AND task.completedAt >= :startOfMonth AND task.completedAt < :endOfMonth)",
        "completedThisMonth"
      )
      .where("task.isDraft = false")
      .groupBy("organization.name")
      .orderBy("organization.name", "ASC", "NULLS LAST")
      .setParameters({
        completed: TaskStatus.COMPLETED,
        endOfMonth,
        inProgress: TaskStatus.IN_PROGRESS,
        now,
        registered: TaskStatus.REGISTERED,
        reviewRequested: TaskStatus.REVIEW_REQUESTED,
        startOfLastWeek,
        startOfMonth,
        startOfThisWeek,
        startOfToday,
        startOfTomorrow
      })
      .getRawMany<TaskStatusSummaryByBranchRow>();
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

  async findActiveCountRowsByCategory(statuses?: TaskStatus[]): Promise<TaskCategoryCountRow[]> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder("task")
      .select("task.category", "category")
      .addSelect("COUNT(task.id)", "count")
      .where("task.isDraft = false");

    if (statuses?.length) {
      queryBuilder.andWhere("task.status IN (:...statuses)", { statuses });
    }

    return queryBuilder
      .groupBy("task.category")
      .orderBy("task.category", "ASC")
      .getRawMany<TaskCategoryCountRow>();
  }

  async findRecentWorkStatus(options: FindRecentWorkStatusOptions): Promise<Task[]> {
    let limitedTaskIds: number[] | undefined;

    if (options.limit) {
      const idQueryBuilder = this.taskRepository
        .createQueryBuilder("task")
        .select("task.id", "taskId")
        .where("task.status IN (:...statuses)", { statuses: options.statuses })
        .andWhere("task.isDraft = false");

      if (options.memberId) {
        idQueryBuilder.andWhere("(task.assigneeId = :memberId OR task.createdBy = :memberId)", {
          memberId: options.memberId
        });
      }

      if (options.category) {
        idQueryBuilder.andWhere("task.category = :category", { category: options.category });
      }

      if (options.prioritizeIncomplete) {
        idQueryBuilder
          .addSelect(
            "CASE WHEN task.status = :completedStatus THEN 1 ELSE 0 END",
            "status_priority"
          )
          .addSelect(
            "CASE WHEN task.status <> :completedStatus THEN task.createdAt END",
            "incomplete_created_at"
          )
          .addSelect(
            "CASE WHEN task.status = :completedStatus THEN task.updatedAt END",
            "completed_updated_at"
          )
          .setParameter("completedStatus", TaskStatus.COMPLETED)
          .orderBy("status_priority", "ASC")
          .addOrderBy("incomplete_created_at", "ASC", "NULLS LAST")
          .addOrderBy("completed_updated_at", "DESC", "NULLS LAST")
          .addOrderBy("task.id", "ASC");
      } else if (options.sortOrder === TaskSortOrder.OLDEST) {
        idQueryBuilder.orderBy("task.updatedAt", "ASC").addOrderBy("task.id", "ASC");
      } else {
        idQueryBuilder.orderBy("task.updatedAt", "DESC").addOrderBy("task.id", "DESC");
      }

      const idRows = await idQueryBuilder
        .take(options.limit)
        .getRawMany<{ taskId: number }>();
      limitedTaskIds = idRows.map((row) => Number(row.taskId));

      if (limitedTaskIds.length === 0) {
        return [];
      }
    }

    const queryBuilder = this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.assignee", "assignee")
      .leftJoinAndSelect("assignee.positionInfo", "assigneePosition")
      .leftJoinAndSelect("task.creator", "creator")
      .leftJoinAndSelect("creator.positionInfo", "creatorPosition")
      .leftJoinAndSelect("creator.organization", "creatorOrganization")
      .leftJoinAndSelect("task.attachments", "attachments")
      .leftJoinAndSelect("task.comments", "comments")
      .leftJoinAndSelect("comments.creator", "commentCreator")
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

    if (options.category) {
      queryBuilder.andWhere("task.category = :category", { category: options.category });
    }

    if (limitedTaskIds) {
      queryBuilder.andWhere("task.id IN (:...limitedTaskIds)", { limitedTaskIds });
    }

    if (options.sortOrder === TaskSortOrder.LATEST) {
      queryBuilder.orderBy("task.updatedAt", "DESC");
    } else if (options.sortOrder === TaskSortOrder.OLDEST) {
      queryBuilder.orderBy("task.updatedAt", "ASC");
    } else {
      queryBuilder.orderBy("task.updatedAt", "DESC");
    }

    const tasks = await queryBuilder.getMany();

    if (limitedTaskIds) {
      const taskOrder = new Map(limitedTaskIds.map((taskId, index) => [taskId, index]));
      tasks.sort(
        (left, right) =>
          (taskOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
          (taskOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER)
      );
    }

    return tasks;
  }

  async findDetailById(id: number): Promise<Task | null> {
    return this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.assignee", "assignee")
      .leftJoinAndSelect("assignee.positionInfo", "assigneePosition")
      .leftJoinAndSelect("assignee.branchInfo", "assigneeBranch")
      .leftJoinAndSelect("assignee.organization", "assigneeOrganization")
      .leftJoinAndSelect("task.creator", "creator")
      .leftJoinAndSelect("creator.positionInfo", "creatorPosition")
      .leftJoinAndSelect("creator.branchInfo", "creatorBranch")
      .leftJoinAndSelect("creator.organization", "creatorOrganization")
      .leftJoinAndSelect("task.attachments", "attachments")
      .leftJoinAndSelect("task.comments", "comments")
      .leftJoinAndSelect("comments.creator", "commentCreator")
      .leftJoinAndSelect("commentCreator.positionInfo", "commentCreatorPosition")
      .leftJoinAndSelect("commentCreator.branchInfo", "commentCreatorBranch")
      .leftJoinAndSelect("commentCreator.organization", "commentCreatorOrganization")
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

  async deleteDraftByIdAndCreator(id: number, createdBy: number): Promise<void> {
    await this.taskRepository.delete({
      id,
      createdBy,
      isDraft: true
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
