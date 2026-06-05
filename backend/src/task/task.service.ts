import { Injectable } from "@nestjs/common";
import { CurrentMember } from "../auth/type/current-member.type";
import { MemberRepository } from "../member/member.repository";
import { TaskCreateRequest } from "./dto/task-create.request";
import { TaskCreateResponse } from "./dto/task-create.response";
import { TaskStatusSummaryResponse } from "./dto/task-status-summary.response";
import { TaskAttachment } from "./entity/task-attachment.entity";
import { TaskAssigneeScope } from "./enum/task-assignee-scope.enum";
import { TaskStatus } from "./enum/task-status.enum";
import { TaskInvalidAssigneeException } from "./exception/task-invalid-assignee.exception";
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

  private async findAssigneeIds(request: TaskCreateRequest): Promise<number[]> {
    if (request.assigneeScope === TaskAssigneeScope.SINGLE) {
      if (!request.assigneeId) {
        throw new TaskInvalidAssigneeException();
      }

      return [request.assigneeId];
    }

    const members = await this.memberRepository.findActiveAssignableMembers();
    return members.map((member) => member.id);
  }

  private createAttachments(taskId: number, request: TaskCreateRequest): TaskAttachment[] {
    return request.attachments?.map((attachmentRequest) => attachmentRequest.toEntity(taskId)) ?? [];
  }
}
