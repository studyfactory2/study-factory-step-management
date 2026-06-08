import { BadRequestException, Injectable } from "@nestjs/common";
import { AdminDashboardEmployeeResponse, AdminDashboardTaskCountsResponse } from "../admin/dto/admin-dashboard.response";
import { Member } from "../member/entity/member.entity";
import { MemberRole } from "../member/enum/member-role.enum";
import { MemberNotFoundException } from "../member/exception/member-not-found.exception";
import { MemberRepository } from "../member/member.repository";
import { TaskStatus } from "../task/enum/task-status.enum";
import { TaskCountRow, TaskRepository } from "../task/task.repository";
import { FavoriteMemberRepository } from "./favorite-member.repository";

@Injectable()
export class FavoriteMemberService {
  private readonly maxFavoriteMemberCount = 10;

  constructor(
    private readonly favoriteMemberRepository: FavoriteMemberRepository,
    private readonly memberRepository: MemberRepository,
    private readonly taskRepository: TaskRepository
  ) {}

  async addFavoriteMember(ownerMemberId: number, memberId: number): Promise<AdminDashboardEmployeeResponse[]> {
    await this.validateOwner(ownerMemberId);

    const member = await this.memberRepository.findById(memberId);
    if (!member || !member.isActive || member.roleType === MemberRole.CEO || member.roleType === MemberRole.ADMIN) {
      throw new MemberNotFoundException(memberId);
    }

    const alreadyExists = await this.favoriteMemberRepository.exists(ownerMemberId, memberId);
    if (!alreadyExists) {
      const favoriteMemberCount = await this.favoriteMemberRepository.countByOwnerMemberId(ownerMemberId);

      if (favoriteMemberCount >= this.maxFavoriteMemberCount) {
        throw new BadRequestException("함께 프로젝트 중 직원은 최대 10명까지 등록할 수 있습니다.");
      }

      await this.favoriteMemberRepository.save(ownerMemberId, memberId);
    }

    return this.getFavoriteMembers(ownerMemberId);
  }

  async deleteFavoriteMember(ownerMemberId: number, memberId: number): Promise<AdminDashboardEmployeeResponse[]> {
    await this.validateOwner(ownerMemberId);
    await this.favoriteMemberRepository.deleteByOwnerMemberIdAndMemberId(ownerMemberId, memberId);

    return this.getFavoriteMembers(ownerMemberId);
  }

  async getCandidateMembers(ownerMemberId: number): Promise<AdminDashboardEmployeeResponse[]> {
    await this.validateOwner(ownerMemberId);

    const [members, taskCountRows] = await Promise.all([
      this.memberRepository.findActiveAssignableMembers(),
      this.findTaskCountRows()
    ]);

    return this.toEmployeeResponses(members, taskCountRows);
  }

  async getFavoriteMemberEntities(ownerMemberId: number): Promise<Member[]> {
    const favoriteMembers = await this.favoriteMemberRepository.findByOwnerMemberId(ownerMemberId);

    return favoriteMembers.map((favoriteMember) => favoriteMember.member);
  }

  async getFavoriteMembers(ownerMemberId: number): Promise<AdminDashboardEmployeeResponse[]> {
    await this.validateOwner(ownerMemberId);

    const [members, taskCountRows] = await Promise.all([
      this.getFavoriteMemberEntities(ownerMemberId),
      this.findTaskCountRows()
    ]);

    return this.toEmployeeResponses(members, taskCountRows);
  }

  private createEmptyTaskCounts(): AdminDashboardTaskCountsResponse {
    return {
      registered: 0,
      inProgress: 0,
      reviewRequested: 0
    };
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

  private async findTaskCountRows(): Promise<TaskCountRow[]> {
    return this.taskRepository.findActiveCountRowsByAssigneeAndStatus([
      TaskStatus.REGISTERED,
      TaskStatus.IN_PROGRESS,
      TaskStatus.REVIEW_REQUESTED
    ]);
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

  private toEmployeeResponses(
    members: Member[],
    taskCountRows: TaskCountRow[]
  ): AdminDashboardEmployeeResponse[] {
    const countMap = this.createTaskCountMap(taskCountRows);

    return members.map((member) => {
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

  private async validateOwner(ownerMemberId: number): Promise<void> {
    const ownerMember = await this.memberRepository.findById(ownerMemberId);

    if (!ownerMember) {
      throw new MemberNotFoundException(ownerMemberId);
    }
  }
}
