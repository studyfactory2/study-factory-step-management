import { Injectable } from "@nestjs/common";
import {
  AdminBranchStaffCountResponse,
  AdminDashboardBranchGroupResponse,
  AdminDashboardEmployeeResponse,
  AdminDashboardRecentOutputResponse,
  AdminDashboardResponse,
  AdminDashboardTaskCountsResponse
} from "./dto/admin-dashboard.response";
import { Member } from "../member/entity/member.entity";
import { MemberRole } from "../member/enum/member-role.enum";
import { MemberNotFoundException } from "../member/exception/member-not-found.exception";
import { MemberRepository } from "../member/member.repository";
import { TaskStatus } from "../task/enum/task-status.enum";
import { TaskRepository, TaskCountRow } from "../task/task.repository";
import { AdminDashboardQueryRequest } from "./dto/admin-dashboard-query.request";

@Injectable()
export class AdminService {
  private readonly employeeRoleOrder = [
    MemberRole.DEVELOPMENT_LEAD,
    MemberRole.DEVELOPER,
    MemberRole.FACTORY_MANAGER
  ];

  private readonly dashboardEmployeeRoles = [
    MemberRole.DEVELOPMENT_LEAD,
    MemberRole.DEVELOPER,
    MemberRole.FACTORY_MANAGER
  ];

  private readonly branchStaffRoles = [MemberRole.EMPLOYEE, MemberRole.STAFF];

  constructor(
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
        this.findDashboardEmployees(),
        this.findTaskCountRows(),
        this.findBranchGroups(),
        this.findRecentOutputs(query)
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
    const employees = await this.memberRepository.findActiveByRoleTypes(this.dashboardEmployeeRoles);

    return employees.sort((a, b) => {
      const roleOrderDifference = this.getRoleOrder(a.roleType) - this.getRoleOrder(b.roleType);

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
      this.branchStaffRoles
    );

    return rows.map((row) => ({
      branch: row.branch ?? "미지정",
      memberCount: Number(row.memberCount)
    }));
  }

  private async findRecentOutputs(
    query: AdminDashboardQueryRequest
  ): Promise<AdminDashboardRecentOutputResponse[]> {
    const status = query.status ?? TaskStatus.REVIEW_REQUESTED;
    const tasks = await this.taskRepository.findRecentWorkStatus({
      limit: 10,
      sortOrder: query.sortOrder,
      status
    });

    return tasks.map((task) => ({
      taskId: task.id,
      taskTitle: task.title,
      taskStatus: task.status,
      memberId: task.assignee.id,
      memberName: task.assignee.name,
      memberRole: task.assignee.roleType,
      startedAt: task.createdAt,
      submittedAt: task.status === TaskStatus.REVIEW_REQUESTED ? task.reviewRequestedAt : null,
      attachmentPreviewUrls: task.attachments.map((attachment) => attachment.imageUrl)
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

  private getRoleOrder(roleType: MemberRole): number {
    const order = this.employeeRoleOrder.indexOf(roleType);

    return order === -1 ? this.employeeRoleOrder.length : order;
  }
}
