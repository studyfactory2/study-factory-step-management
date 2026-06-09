import { Injectable } from "@nestjs/common";
import {
  AdminBranchStaffCountResponse,
  AdminDashboardBranchGroupResponse,
  AdminDashboardEmployeeResponse,
  AdminDashboardRecentOutputResponse,
  AdminDashboardResponse,
  AdminDashboardTaskCountsResponse
} from "./dto/admin-dashboard.response";
import { FavoriteMemberService } from "../favorite-member/favorite-member.service";
import { Member } from "../member/entity/member.entity";
import { MemberRole } from "../member/enum/member-role.enum";
import { MemberNotFoundException } from "../member/exception/member-not-found.exception";
import { MemberRepository } from "../member/member.repository";
import { Task } from "../task/entity/task.entity";
import { TaskStatus } from "../task/enum/task-status.enum";
import { TaskRepository, TaskCountRow } from "../task/task.repository";
import { AdminDashboardQueryRequest } from "./dto/admin-dashboard-query.request";

@Injectable()
export class AdminService {
  private readonly employeePositionOrder = ["DEVELOPMENT_LEAD", "DEVELOPER", "OPERATIONS_MANAGER"];
  private readonly dashboardEmployeePositionCodes = ["DEVELOPMENT_LEAD", "DEVELOPER", "OPERATIONS_MANAGER"];
  private readonly branchStaffPositionCodes = ["EMPLOYEE", "STAFF"];

  constructor(
    private readonly favoriteMemberService: FavoriteMemberService,
    private readonly memberRepository: MemberRepository,
    private readonly taskRepository: TaskRepository
  ) {}

  async getDashboard(
    currentMemberId: number,
    query: AdminDashboardQueryRequest = {}
  ): Promise<AdminDashboardResponse> {
    const [currentMember, employees, taskCountRows, branchGroups, recentOutputs] =
      await Promise.all([
        this.findCurrentMember(currentMemberId),
        this.favoriteMemberService.getFavoriteMemberEntities(currentMemberId),
        this.findTaskCountRows(),
        this.findBranchGroups(),
        this.findRecentOutputs(query, currentMemberId)
      ]);

    return {
      currentMember: {
        id: currentMember.id,
        name: currentMember.name,
        roleType: currentMember.roleType,
        branch: currentMember.branch
      },
      employees: this.toEmployeeResponses(employees, taskCountRows),
      branchGroups,
      recentOutputs
    };
  }

  async getEmployees(currentMemberId: number): Promise<AdminDashboardEmployeeResponse[]> {
    await this.findCurrentMember(currentMemberId);

    const [employees, taskCountRows] = await Promise.all([
      this.findDashboardEmployees(),
      this.findTaskCountRows()
    ]);

    return this.toEmployeeResponses(employees, taskCountRows);
  }

  async getBranchStaffCounts(currentMemberId: number): Promise<AdminBranchStaffCountResponse[]> {
    await this.findCurrentMember(currentMemberId);

    return this.findBranchStaffCounts();
  }

  private async findCurrentMember(currentMemberId: number): Promise<Member> {
    const currentMember = await this.memberRepository.findById(currentMemberId);

    if (!currentMember) {
      throw new MemberNotFoundException(currentMemberId);
    }

    return currentMember;
  }

  private async findDashboardEmployees(): Promise<Member[]> {
    const employees = await this.memberRepository.findActiveByPositionCodes(
      this.dashboardEmployeePositionCodes
    );

    return this.sortMembersByPosition(employees);
  }

  private sortMembersByPosition(employees: Member[]): Member[] {
    return employees.sort((a, b) => {
      const roleOrderDifference =
        this.getPositionOrder(a.positionInfo?.code ?? "") -
        this.getPositionOrder(b.positionInfo?.code ?? "");

      if (roleOrderDifference !== 0) {
        return roleOrderDifference;
      }

      return a.id - b.id;
    });
  }

  private async findTaskCountRows(): Promise<TaskCountRow[]> {
    return this.taskRepository.findActiveCountRowsByAssigneeAndStatus([
      TaskStatus.REGISTERED,
      TaskStatus.IN_PROGRESS,
      TaskStatus.REVIEW_REQUESTED
    ]);
  }

  private async findBranchGroups(): Promise<AdminDashboardBranchGroupResponse[]> {
    return this.findBranchStaffCounts();
  }

  private async findBranchStaffCounts(): Promise<AdminBranchStaffCountResponse[]> {
    const rows = await this.memberRepository.countActiveMembersByBranchAndRoleTypes(
      [MemberRole.EMPLOYEE]
    );
    const positionRows = await this.memberRepository.countActiveMembersByBranchAndPositionCodes(
      this.branchStaffPositionCodes
    );

    return positionRows.map((row) => ({
      branch: row.branch ?? "미지정",
      memberCount: Number(row.memberCount)
    }));
  }

  private async findRecentOutputs(
    query: AdminDashboardQueryRequest,
    currentMemberId: number
  ): Promise<AdminDashboardRecentOutputResponse[]> {
    const statuses = query.status?.length ? query.status : [TaskStatus.REVIEW_REQUESTED];
    const tasks = await this.taskRepository.findRecentWorkStatus({
      limit: 10,
      sortOrder: query.sortOrder,
      statuses,
      viewerId: currentMemberId
    });

    return tasks.map((task) => ({
      taskId: task.id,
      taskTitle: task.title,
      oneLineComment: this.findLatestCommentOneLineComment(task),
      taskStatus: task.status,
      memberId: task.assignee.id,
      memberName: task.assignee.name,
      memberRole: task.assignee.roleType,
      memberPositionName: task.assignee.positionInfo?.name ?? null,
      startedAt: task.createdAt,
      submittedAt: task.status === TaskStatus.REVIEW_REQUESTED ? task.reviewRequestedAt : null,
      attachmentPreviewUrls: task.attachments.map((attachment) => attachment.imageUrl),
      isNew: this.isNewTaskForMember(task, currentMemberId)
    }));
  }

  private toEmployeeResponses(
    employees: Member[],
    taskCountRows: TaskCountRow[]
  ): AdminDashboardEmployeeResponse[] {
    const countMap = this.createTaskCountMap(taskCountRows);

    return employees.map((member) => {
      const taskCounts = countMap.get(member.id) ?? this.createEmptyTaskCounts();

      return {
        id: member.id,
        name: member.name,
        roleType: member.roleType,
        positionCode: member.positionInfo?.code ?? null,
        positionName: member.positionInfo?.name ?? null,
        branch: member.branch,
        highestTaskStatus: this.getHighestTaskStatus(taskCounts),
        taskCounts
      };
    });
  }

  private createTaskCountMap(taskCountRows: TaskCountRow[]): Map<number, AdminDashboardTaskCountsResponse> {
    const countMap = new Map<number, AdminDashboardTaskCountsResponse>();

    taskCountRows.forEach((row) => {
      const assigneeId = Number(row.assigneeId);
      const taskCounts = countMap.get(assigneeId) ?? this.createEmptyTaskCounts();

      if (row.status === TaskStatus.REGISTERED) {
        taskCounts.registered = Number(row.count);
      }

      if (row.status === TaskStatus.IN_PROGRESS) {
        taskCounts.inProgress = Number(row.count);
      }

      if (row.status === TaskStatus.REVIEW_REQUESTED) {
        taskCounts.reviewRequested = Number(row.count);
      }

      countMap.set(assigneeId, taskCounts);
    });

    return countMap;
  }

  private createEmptyTaskCounts(): AdminDashboardTaskCountsResponse {
    return {
      registered: 0,
      inProgress: 0,
      reviewRequested: 0
    };
  }

  private getHighestTaskStatus(
    taskCounts: AdminDashboardTaskCountsResponse
  ): Exclude<TaskStatus, TaskStatus.COMPLETED> | null {
    if (taskCounts.reviewRequested > 0) {
      return TaskStatus.REVIEW_REQUESTED;
    }

    if (taskCounts.inProgress > 0) {
      return TaskStatus.IN_PROGRESS;
    }

    if (taskCounts.registered > 0) {
      return TaskStatus.REGISTERED;
    }

    return null;
  }

  private getPositionOrder(positionCode: string): number {
    const order = this.employeePositionOrder.indexOf(positionCode);

    return order === -1 ? this.employeePositionOrder.length : order;
  }

  private isNewTaskForMember(task: Task, memberId: number): boolean {
    if (task.createdBy !== memberId && task.assigneeId !== memberId) {
      return false;
    }

    const readStatus = task.readStatuses?.[0];

    if (!readStatus) {
      return task.createdBy !== memberId;
    }

    return readStatus.lastViewedAt.getTime() < task.updatedAt.getTime();
  }

  private findLatestCommentOneLineComment(task: Task): string | null {
    const latestComment = task.comments?.reduce((latest, comment) => {
      if (!latest) {
        return comment;
      }

      return comment.updatedAt.getTime() > latest.updatedAt.getTime() ? comment : latest;
    }, null as Task["comments"][number] | null);

    return latestComment?.oneLineComment ?? null;
  }
}
