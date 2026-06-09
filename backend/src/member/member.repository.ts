import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Not, Repository } from "typeorm";
import { Member } from "./entity/member.entity";
import { MemberPreRegistration } from "./entity/member-pre-registration.entity";
import { MemberRole } from "./enum/member-role.enum";

export type BranchMemberCountRow = {
  branch: string | null;
  memberCount: string;
};

@Injectable()
export class MemberRepository {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(MemberPreRegistration)
    private readonly memberPreRegistrationRepository: Repository<MemberPreRegistration>
  ) {}

  async findAll(): Promise<Member[]> {
    return this.memberRepository.find({
      relations: {
        positionInfo: true,
        positionDuty: true
      }
    });
  }

  async findById(id: number): Promise<Member | null> {
    return this.memberRepository.findOne({
      relations: {
        positionInfo: true,
        positionDuty: true
      },
      where: { id }
    });
  }

  async findPreRegistrations(): Promise<MemberPreRegistration[]> {
    return this.memberPreRegistrationRepository.find({
      relations: {
        positionInfo: true,
        positionDuty: true
      },
      order: {
        isRegistered: "ASC",
        createdAt: "DESC"
      }
    });
  }

  async findBranches(): Promise<string[]> {
    const memberBranches = await this.memberRepository
      .createQueryBuilder("member")
      .select("DISTINCT member.branch", "branch")
      .where("member.branch IS NOT NULL")
      .andWhere("member.branch != ''")
      .getRawMany<{ branch: string }>();
    const preRegistrationBranches = await this.memberPreRegistrationRepository
      .createQueryBuilder("preRegistration")
      .select("DISTINCT preRegistration.branch", "branch")
      .where("preRegistration.branch IS NOT NULL")
      .andWhere("preRegistration.branch != ''")
      .getRawMany<{ branch: string }>();

    return Array.from(
      new Set([
        ...memberBranches.map((row) => row.branch),
        ...preRegistrationBranches.map((row) => row.branch)
      ])
    ).sort((first, second) => first.localeCompare(second, "ko"));
  }

  async findPreRegistrationById(id: number): Promise<MemberPreRegistration | null> {
    return this.memberPreRegistrationRepository.findOne({
      relations: {
        positionInfo: true,
        positionDuty: true
      },
      where: { id }
    });
  }

  async deletePreRegistration(preRegistration: MemberPreRegistration): Promise<void> {
    await this.memberPreRegistrationRepository.remove(preRegistration);
  }

  async findActiveByRoleTypes(roleTypes: MemberRole[]): Promise<Member[]> {
    return this.memberRepository.find({
      where: {
        isActive: true,
        roleType: In(roleTypes)
      }
    });
  }

  async findActiveAssignableMembers(): Promise<Member[]> {
    return this.memberRepository.find({
      relations: {
        positionInfo: true,
        positionDuty: true
      },
      where: {
        isActive: true,
        roleType: Not(MemberRole.ADMIN)
      },
      order: {
        positionInfo: {
          displayOrder: "ASC"
        },
        name: "ASC"
      }
    });
  }

  async findActiveAssignableMembersByFilter(branch?: string, positionId?: number): Promise<Member[]> {
    const queryBuilder = this.memberRepository
      .createQueryBuilder("member")
      .leftJoinAndSelect("member.positionInfo", "position")
      .leftJoinAndSelect("member.positionDuty", "positionDuty")
      .where("member.isActive = true")
      .andWhere("member.roleType NOT IN (:...roleTypes)", {
        roleTypes: [MemberRole.ADMIN]
      });

    if (branch) {
      queryBuilder.andWhere("member.branch = :branch", { branch });
    }

    if (positionId) {
      queryBuilder.andWhere("member.positionId = :positionId", { positionId });
    }

    return queryBuilder
      .orderBy("position.displayOrder", "ASC")
      .addOrderBy("member.name", "ASC")
      .getMany();
  }

  async findActiveByPositionNames(positionNames: string[]): Promise<Member[]> {
    return this.memberRepository
      .createQueryBuilder("member")
      .leftJoinAndSelect("member.positionInfo", "position")
      .leftJoinAndSelect("member.positionDuty", "positionDuty")
      .where("member.isActive = true")
      .andWhere("position.name IN (:...positionNames)", { positionNames })
      .orderBy("position.displayOrder", "ASC")
      .addOrderBy("member.name", "ASC")
      .getMany();
  }

  async countActiveMembersByBranchAndPositionNames(positionNames: string[]): Promise<BranchMemberCountRow[]> {
    return this.memberRepository
      .createQueryBuilder("member")
      .leftJoin("member.positionInfo", "position")
      .select("member.branch", "branch")
      .addSelect("COUNT(member.id)", "memberCount")
      .where("member.isActive = true")
      .andWhere("position.name IN (:...positionNames)", { positionNames })
      .groupBy("member.branch")
      .orderBy("member.branch", "ASC")
      .getRawMany<BranchMemberCountRow>();
  }

  async findByNameAndRoleType(name: string, roleType: MemberRole): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: {
        name,
        roleType
      }
    });
  }

  async findByNameAndRoleTypeAndPasswordHash(
    name: string,
    roleType: MemberRole,
    passwordHash: string
  ): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: {
        name,
        roleType,
        passwordHash
      }
    });
  }

  async findByNameAndPasswordHash(name: string, passwordHash: string): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: {
        name,
        passwordHash
      }
    });
  }

  async countByNameAndBranch(name: string, branch: string): Promise<number> {
    return this.memberRepository.count({
      where: {
        name,
        branch
      }
    });
  }

  async save(member: Member): Promise<Member> {
    return this.memberRepository.save(member);
  }

  async findPendingPreRegistrationByNameAndBranch(
    name: string,
    branch: string
  ): Promise<MemberPreRegistration | null> {
    return this.memberPreRegistrationRepository.findOne({
      order: {
        createdAt: "DESC"
      },
      where: {
        branch,
        name,
        isRegistered: false
      }
    });
  }

  async savePreRegistration(preRegistration: MemberPreRegistration): Promise<MemberPreRegistration> {
    return this.memberPreRegistrationRepository.save(preRegistration);
  }

  async countActiveMembersByBranchAndRoleTypes(roleTypes: MemberRole[]): Promise<BranchMemberCountRow[]> {
    return this.memberRepository
      .createQueryBuilder("member")
      .select("member.branch", "branch")
      .addSelect("COUNT(member.id)", "memberCount")
      .where("member.isActive = true")
      .andWhere("member.roleType IN (:...roleTypes)", { roleTypes })
      .groupBy("member.branch")
      .orderBy("member.branch", "ASC")
      .getRawMany<BranchMemberCountRow>();
  }
}
