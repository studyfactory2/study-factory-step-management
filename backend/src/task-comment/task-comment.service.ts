import { Injectable } from "@nestjs/common";
import { CurrentMember } from "../auth/type/current-member.type";
import { Task } from "../task/entity/task.entity";
import { TaskStatus } from "../task/enum/task-status.enum";
import { TaskNotFoundException } from "../task/exception/task-not-found.exception";
import { TaskCommentCreateRequest } from "./dto/task-comment-create.request";
import { TaskCommentResponse } from "./dto/task-comment.response";
import { TaskCommentAttachment } from "./entity/task-comment-attachment.entity";
import { TaskComment } from "./entity/task-comment.entity";
import { TaskCommentRepository } from "./task-comment.repository";

@Injectable()
export class TaskCommentService {
  constructor(private readonly taskCommentRepository: TaskCommentRepository) {}

  async create(
    taskId: number,
    request: TaskCommentCreateRequest,
    currentMember: CurrentMember
  ): Promise<TaskCommentResponse> {
    const task = await this.findPublishedTaskEntity(taskId);

    if (request.status) {
      await this.updateTaskStatus(task, request.status);
    }

    const comment = request.toEntity(taskId, currentMember.memberId);
    const savedComment = await this.taskCommentRepository.saveComment(comment);
    const attachments = this.createAttachments(savedComment.id, request);

    if (attachments.length > 0) {
      savedComment.attachments = await this.taskCommentRepository.saveAttachments(attachments);
    } else {
      savedComment.attachments = [];
    }

    return this.toResponse(savedComment);
  }

  async findByTaskId(taskId: number): Promise<TaskCommentResponse[]> {
    await this.findPublishedTaskEntity(taskId);

    const comments = await this.taskCommentRepository.findByTaskId(taskId);
    return comments.map((comment) => this.toResponse(comment));
  }

  private async findPublishedTaskEntity(taskId: number) {
    const task = await this.taskCommentRepository.findPublishedTaskById(taskId);

    if (!task) {
      throw new TaskNotFoundException(taskId);
    }

    return task;
  }

  private async updateTaskStatus(task: Task, status: TaskStatus): Promise<void> {
    task.status = status;

    if (status === TaskStatus.REVIEW_REQUESTED) {
      task.reviewRequestedAt = new Date();
    }

    if (status === TaskStatus.COMPLETED) {
      task.completedAt = new Date();
    }

    if (status !== TaskStatus.COMPLETED) {
      task.completedAt = null;
    }

    await this.taskCommentRepository.saveTask(task);
  }

  private createAttachments(
    taskCommentId: number,
    request: TaskCommentCreateRequest
  ): TaskCommentAttachment[] {
    return request.attachments?.map((attachmentRequest) => attachmentRequest.toEntity(taskCommentId)) ?? [];
  }

  private toResponse(comment: TaskComment): TaskCommentResponse {
    return {
      id: comment.id,
      taskId: comment.taskId,
      content: comment.content,
      oneLineComment: comment.oneLineComment,
      attachments: comment.attachments.map((attachment) => ({
        id: attachment.id,
        imageUrl: attachment.imageUrl,
        originalName: attachment.originalName,
        createdAt: attachment.createdAt
      })),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    };
  }
}
