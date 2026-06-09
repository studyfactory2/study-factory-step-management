import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "../task/entity/task.entity";
import { TaskCommentAttachment } from "./entity/task-comment-attachment.entity";
import { TaskComment } from "./entity/task-comment.entity";

@Injectable()
export class TaskCommentRepository {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskComment)
    private readonly taskCommentRepository: Repository<TaskComment>,
    @InjectRepository(TaskCommentAttachment)
    private readonly taskCommentAttachmentRepository: Repository<TaskCommentAttachment>
  ) {}

  async findPublishedTaskById(id: number): Promise<Task | null> {
    return this.taskRepository.findOne({
      where: {
        id,
        isDraft: false
      }
    });
  }

  async saveComment(comment: TaskComment): Promise<TaskComment> {
    return this.taskCommentRepository.save(comment);
  }

  async saveTask(task: Task): Promise<Task> {
    return this.taskRepository.save(task);
  }

  async saveAttachments(attachments: TaskCommentAttachment[]): Promise<TaskCommentAttachment[]> {
    return this.taskCommentAttachmentRepository.save(attachments);
  }

  async findByTaskId(taskId: number): Promise<TaskComment[]> {
    return this.taskCommentRepository
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.attachments", "attachments")
      .where("comment.taskId = :taskId", { taskId })
      .orderBy("comment.createdAt", "ASC")
      .addOrderBy("attachments.createdAt", "ASC")
      .getMany();
  }

  async findRecent(limit: number, memberId?: number): Promise<TaskComment[]> {
    const queryBuilder = this.taskCommentRepository
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.task", "task")
      .leftJoinAndSelect("task.assignee", "assignee")
      .leftJoinAndSelect("assignee.positionInfo", "position")
      .leftJoinAndSelect("comment.creator", "creator")
      .leftJoinAndSelect("creator.positionInfo", "creatorPosition")
      .where("task.isDraft = false")
      .orderBy("comment.updatedAt", "DESC")
      .limit(limit);

    if (memberId) {
      queryBuilder.andWhere("(task.assigneeId = :memberId OR task.createdBy = :memberId)", {
        memberId
      });
    }

    return queryBuilder.getMany();
  }
}
