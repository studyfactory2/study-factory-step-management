import { Injectable } from "@nestjs/common";
import { CurrentMember } from "../auth/type/current-member.type";
import { MemberRepository } from "../member/member.repository";
import { TaskCommentResponse } from "../task-comment/dto/task-comment.response";
import { TaskCreateRequest } from "./dto/task-create.request";
import { TaskCreateResponse } from "./dto/task-create.response";
import { TaskDescriptionUpdateRequest } from "./dto/task-description-update.request";
import { TaskDetailMemberResponse, TaskDetailResponse } from "./dto/task-detail.response";
import { TaskDraftResponse } from "./dto/task-draft.response";
import { TaskDraftSaveRequest } from "./dto/task-draft-save.request";
import { TaskStatusSummaryResponse } from "./dto/task-status-summary.response";
import { TaskAttachment } from "./entity/task-attachment.entity";
import { TaskComment } from "../task-comment/entity/task-comment.entity";
import { Task } from "./entity/task.entity";
import { TaskAssigneeScope } from "./enum/task-assignee-scope.enum";
import { TaskStatus } from "./enum/task-status.enum";
import { TaskInvalidAssigneeException } from "./exception/task-invalid-assignee.exception";
import { TaskNotFoundException } from "./exception/task-not-found.exception";
import { TaskRepository } from "./task.repository";

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly memberRepository: MemberRepository
  ) {}

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

  async create(request: TaskCreateRequest, currentMember: CurrentMember): Promise<TaskCreateResponse> {
    const assigneeIds = await this.findAssigneeIds(request);
    const tasks = assigneeIds.map((assigneeId) => request.toEntity(assigneeId, currentMember.memberId));
    const savedTasks = await this.taskRepository.saveAll(tasks);

    const attachments = savedTasks.flatMap((task) => this.createAttachments(task.id, request));
    if (attachments.length > 0) {
      await this.taskRepository.saveAttachments(attachments);
    }

    return {
      createdCount: savedTasks.length,
      taskIds: savedTasks.map((task) => task.id)
    };
  }

  async findDetail(id: number): Promise<TaskDetailResponse> {
    const task = await this.taskRepository.findDetailById(id);

    if (!task) {
      throw new TaskNotFoundException(id);
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      descriptionHighlightStart: this.isDescriptionHighlightActive(task)
        ? task.descriptionHighlightStart
        : null,
      descriptionHighlightEnd: this.isDescriptionHighlightActive(task)
        ? task.descriptionHighlightEnd
        : null,
      descriptionHighlightExpiresAt: this.isDescriptionHighlightActive(task)
        ? task.descriptionHighlightExpiresAt
        : null,
      oneLineComment: task.oneLineComment,
      status: task.status,
      assignee: this.toTaskMemberResponse(task.assignee),
      creator: this.toTaskMemberResponse(task.creator),
      attachments: task.attachments.map((attachment) => ({
        id: attachment.id,
        imageUrl: attachment.imageUrl,
        originalName: attachment.originalName,
        createdAt: attachment.createdAt
      })),
      comments: task.comments.map((comment) => this.toTaskCommentResponse(comment)),
      completedAt: task.completedAt,
      reviewRequestedAt: task.reviewRequestedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }

  async updateDescription(
    id: number,
    request: TaskDescriptionUpdateRequest
  ): Promise<TaskDetailResponse> {
    const task = await this.taskRepository.findPublishedById(id);

    if (!task) {
      throw new TaskNotFoundException(id);
    }

    const highlightRange = this.findAddedDescriptionRange(task.description, request.description);
    task.description = request.description;
    task.descriptionHighlightStart = highlightRange?.start ?? null;
    task.descriptionHighlightEnd = highlightRange?.end ?? null;
    task.descriptionHighlightExpiresAt = highlightRange
      ? new Date(Date.now() + 24 * 60 * 60 * 1000)
      : null;

    await this.taskRepository.save(task);
    return this.findDetail(id);
  }

  async createDraft(
    request: TaskDraftSaveRequest,
    currentMember: CurrentMember
  ): Promise<TaskDraftResponse> {
    const task = request.toEntity(currentMember.memberId);
    const savedTask = await this.taskRepository.save(task);

    return this.toTaskDraftResponse(savedTask);
  }

  async findDrafts(currentMember: CurrentMember): Promise<TaskDraftResponse[]> {
    const drafts = await this.taskRepository.findDraftsByCreator(currentMember.memberId);
    return drafts.map((draft) => this.toTaskDraftResponse(draft));
  }

  async updateDraft(
    id: number,
    request: TaskDraftSaveRequest,
    currentMember: CurrentMember
  ): Promise<TaskDraftResponse> {
    const draft = await this.findDraftEntity(id, currentMember.memberId);
    draft.title = request.title;
    draft.description = request.description ?? "";
    draft.assigneeId = request.assigneeId;

    const savedDraft = await this.taskRepository.save(draft);
    return this.toTaskDraftResponse(savedDraft);
  }

  async publishDraft(id: number, currentMember: CurrentMember): Promise<TaskCreateResponse> {
    const draft = await this.findDraftEntity(id, currentMember.memberId);
    draft.isDraft = false;
    draft.status = TaskStatus.REGISTERED;

    const savedTask = await this.taskRepository.save(draft);

    return {
      createdCount: 1,
      taskIds: [savedTask.id]
    };
  }

  private async findDraftEntity(id: number, createdBy: number): Promise<Task> {
    const draft = await this.taskRepository.findDraftByIdAndCreator(id, createdBy);

    if (!draft) {
      throw new TaskNotFoundException(id);
    }

    return draft;
  }

  private async findAssigneeIds(request: TaskCreateRequest): Promise<number[]> {
    if (request.assigneeScope === TaskAssigneeScope.SINGLE) {
      if (!request.assigneeId) {
        throw new TaskInvalidAssigneeException();
      }

      return [request.assigneeId];
    }

    const members = await this.memberRepository.findActiveAssignableMembersByFilter(
      request.branch,
      request.positionId
    );
    return members.map((member) => member.id);
  }

  private createAttachments(taskId: number, request: TaskCreateRequest): TaskAttachment[] {
    return request.attachments?.map((attachmentRequest) => attachmentRequest.toEntity(taskId)) ?? [];
  }

  private toTaskMemberResponse(member: Task["assignee"]): TaskDetailMemberResponse {
    return {
      id: member.id,
      name: member.name,
      branch: member.branch,
      roleType: member.roleType,
      positionName: member.positionInfo?.name ?? null
    };
  }

  private toTaskDraftResponse(task: Task): TaskDraftResponse {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      assigneeId: task.assigneeId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }

  private toTaskCommentResponse(comment: TaskComment): TaskCommentResponse {
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

  private findAddedDescriptionRange(
    previousDescription: string,
    nextDescription: string
  ): { end: number; start: number } | null {
    if (previousDescription === nextDescription || nextDescription.length <= previousDescription.length) {
      return null;
    }

    let start = 0;
    while (
      start < previousDescription.length &&
      start < nextDescription.length &&
      previousDescription[start] === nextDescription[start]
    ) {
      start += 1;
    }

    let previousEnd = previousDescription.length - 1;
    let nextEnd = nextDescription.length - 1;
    while (
      previousEnd >= start &&
      nextEnd >= start &&
      previousDescription[previousEnd] === nextDescription[nextEnd]
    ) {
      previousEnd -= 1;
      nextEnd -= 1;
    }

    return {
      end: nextEnd + 1,
      start
    };
  }

  private isDescriptionHighlightActive(task: Task): boolean {
    return Boolean(
      task.descriptionHighlightStart !== null &&
        task.descriptionHighlightEnd !== null &&
        task.descriptionHighlightExpiresAt &&
        task.descriptionHighlightExpiresAt.getTime() > Date.now()
    );
  }
}
