import { ForbiddenException, Injectable } from "@nestjs/common";
import { CurrentMember } from "../auth/type/current-member.type";
import { Member } from "../member/entity/member.entity";
import { MemberRole } from "../member/enum/member-role.enum";
import { Task } from "../task/entity/task.entity";
import { TaskStatus } from "../task/enum/task-status.enum";
import { TaskNotFoundException } from "../task/exception/task-not-found.exception";
import { UploadFile } from "../upload/type/upload-file.type";
import { UploadService } from "../upload/upload.service";
import { TaskCommentActivityResponse } from "./dto/task-comment-activity.response";
import { TaskCommentCreateRequest } from "./dto/task-comment-create.request";
import { TaskCommentResponse } from "./dto/task-comment.response";
import { TaskCommentAttachment } from "./entity/task-comment-attachment.entity";
import { TaskComment } from "./entity/task-comment.entity";
import { TaskCommentRepository } from "./task-comment.repository";

@Injectable()
export class TaskCommentService {
  constructor(
    private readonly taskCommentRepository: TaskCommentRepository,
    private readonly uploadService: UploadService
  ) {}

  async create(
    taskId: number,
    request: TaskCommentCreateRequest,
    currentMember: CurrentMember,
    files: UploadFile[] = []
  ): Promise<TaskCommentResponse> {
    const task = await this.findPublishedTaskEntity(taskId);
    this.validateTaskCommentAccess(task, currentMember);

    const commentStatus = request.status ?? task.status;
    this.validateTaskStatusUpdate(commentStatus, currentMember);
    await this.updateTaskStatus(task, commentStatus);

    const comment = request.toEntity(taskId, currentMember.memberId, commentStatus);
    const savedComment = await this.taskCommentRepository.saveComment(comment);
    const attachments = await this.createAttachments(savedComment.id, files);

    if (attachments.length > 0) {
      savedComment.attachments = await this.taskCommentRepository.saveAttachments(attachments);
    } else {
      savedComment.attachments = [];
    }

    await this.taskCommentRepository.markTaskViewed(taskId, currentMember.memberId);

    const createdComment = await this.taskCommentRepository.findById(savedComment.id);
    return this.toResponse(createdComment ?? savedComment);
  }

  async findByTaskId(
    taskId: number,
    currentMember: CurrentMember
  ): Promise<TaskCommentResponse[]> {
    const task = await this.findPublishedTaskEntity(taskId);
    this.validateTaskCommentAccess(task, currentMember);

    const comments = await this.taskCommentRepository.findByTaskId(taskId);
    return comments.map((comment) => this.toResponse(comment));
  }

  async findRecent(
    limit = 100,
    currentMember?: CurrentMember
  ): Promise<TaskCommentActivityResponse[]> {
    const memberId = currentMember && !this.isAdminRole(currentMember.role)
      ? currentMember.memberId
      : undefined;
    const comments = await this.taskCommentRepository.findRecent(limit, memberId);
    return comments.map((comment) => this.toActivityResponse(comment));
  }

  private async findPublishedTaskEntity(taskId: number) {
    const task = await this.taskCommentRepository.findPublishedTaskById(taskId);

    if (!task) {
      throw new TaskNotFoundException(taskId);
    }

    return task;
  }

  private validateTaskCommentAccess(task: Task, currentMember: CurrentMember): void {
    if (this.isAdminRole(currentMember.role)) {
      return;
    }

    const isAssignee = task.assigneeId === currentMember.memberId;
    const isCreator = task.createdBy === currentMember.memberId;

    if (!isAssignee && !isCreator) {
      throw new ForbiddenException("업무 코멘트 권한이 없습니다.");
    }
  }

  private validateTaskStatusUpdate(status: TaskStatus, currentMember: CurrentMember): void {
    if (status === TaskStatus.COMPLETED && !this.isAdminRole(currentMember.role)) {
      throw new ForbiddenException("완료 상태는 관리자 또는 CEO만 변경할 수 있습니다.");
    }
  }

  private async updateTaskStatus(task: Task, status: TaskStatus): Promise<void> {
    task.updatedAt = new Date();
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

  private async createAttachments(
    taskCommentId: number,
    files: UploadFile[]
  ): Promise<TaskCommentAttachment[]> {
    const uploadedFiles = await this.uploadService.saveImages(files);

    return uploadedFiles.map((uploadedFile) => {
      const attachment = new TaskCommentAttachment();
      attachment.taskCommentId = taskCommentId;
      attachment.imageUrl = uploadedFile.imageUrl;
      attachment.originalName = uploadedFile.originalName;

      return attachment;
    });
  }

  private toResponse(comment: TaskComment): TaskCommentResponse {
    return {
      id: comment.id,
      taskId: comment.taskId,
      creator: {
        id: comment.creator.id,
        name: this.getDisplayName(comment.creator),
        branch: comment.creator.branchInfo?.name ?? null,
        roleType: comment.creator.roleType,
        positionName: comment.creator.positionInfo?.name ?? null
      },
      content: comment.content,
      oneLineComment: comment.oneLineComment,
      status: comment.status,
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

  private toActivityResponse(comment: TaskComment): TaskCommentActivityResponse {
    return {
      id: comment.id,
      taskId: comment.taskId,
      taskTitle: comment.task.title,
      assigneeName: this.getDisplayName(comment.task.assignee),
      assigneeRoleType: comment.task.assignee.roleType,
      assigneePositionName: comment.task.assignee.positionInfo?.name ?? null,
      creatorName: this.getDisplayName(comment.creator),
      creatorRoleType: comment.creator.roleType,
      creatorPositionName: comment.creator.positionInfo?.name ?? null,
      oneLineComment: comment.oneLineComment,
      status: comment.status,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    };
  }

  private isAdminRole(role: MemberRole): boolean {
    return role === MemberRole.ADMIN || role === MemberRole.CEO;
  }

  private getDisplayName(member: Member): string {
    return member.displayName ?? member.name;
  }
}
