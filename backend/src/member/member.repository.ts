import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Not, Repository } from "typeorm";
import { Member } from "./entity/member.entity";
import { MemberPreRegistration } from "./entity/member-pre-registration.entity";
import { OrganizationBranch } from "./entity/organization-branch.entity";
import { Organization } from "./entity/organization.entity";
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
    private readonly memberPreRegistrationRepository: Repository<MemberPreRegistration>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationBranch)
    private readonly branchRepository: Repository<OrganizationBranch>
  ) {}

  async findAll(): Promise<Member[]> {
    return this.memberRepository.find({
      relations: {
        branchInfo: true,
        organization: true,
        positionInfo: true,
        positionDuty: true
      }
    });
  }

  async findById(id: number): Promise<Member | null> {
    return this.memberRepository.findOne({
      relations: {
        branchInfo: true,
        organization: true,
        positionInfo: true,
        positionDuty: true
      },
      where: { id }
    });
  }

  async findPreRegistrations(): Promise<MemberPreRegistration[]> {
    return this.memberPreRegistrationRepository.find({
      relations: {
        branchInfo: true,
        organization: true,
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
    const branches = await this.branchRepository.find({
      relations: {
        organization: true
      },
      where: {
        isActive: true,
        organization: {
          isActive: true
        }
      },
      order: {
        organization: {
          displayOrder: "ASC"
        },
        displayOrder: "ASC",
        name: "ASC"
      }
    });

    return Array.from(new Set(branches.map((branch) => branch.name)));
  }

  async findPreRegistrationById(id: number): Promise<MemberPreRegistration | null> {
    return this.memberPreRegistrationRepository.findOne({
      relations: {
        branchInfo: true,
        organization: true,
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
        branchInfo: true,
        organization: true,
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
      .leftJoinAndSelect("member.organization", "organization")
      .leftJoinAndSelect("member.branchInfo", "branchInfo")
      .where("member.isActive = true")
      .andWhere("member.roleType NOT IN (:...roleTypes)", {
        roleTypes: [MemberRole.ADMIN]
      });

    if (branch) {
      queryBuilder.andWhere("branchInfo.name = :branch", { branch });
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
      .leftJoinAndSelect("member.organization", "organization")
      .leftJoinAndSelect("member.branchInfo", "branchInfo")
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
      .leftJoin("member.organization", "organization")
      .select("organization.name", "branch")
      .addSelect("COUNT(member.id)", "memberCount")
      .where("member.isActive = true")
      .andWhere("position.name IN (:...positionNames)", { positionNames })
      .groupBy("organization.name")
      .orderBy("organization.name", "ASC")
      .getRawMany<BranchMemberCountRow>();
  }

  async findOrganizationByName(name: string): Promise<Organization | null> {
    return this.organizationRepository.findOne({
      where: {
        isActive: true,
        name
      }
    });
  }

  async findBranchByName(name: string): Promise<OrganizationBranch | null> {
    return this.branchRepository.findOne({
      relations: {
        organization: true
      },
      where: {
        isActive: true,
        name
      }
    });
  }

  async findByNameAndRoleType(name: string, roleType: MemberRole): Promise<Member | null> {
    return this.memberRepository.findOne({
      relations: {
        branchInfo: true,
        organization: true
      },
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
      relations: {
        branchInfo: true,
        organization: true
      },
      where: {
        name,
        roleType,
        passwordHash
      }
    });
  }

  async findByNameAndPasswordHash(name: string, passwordHash: string): Promise<Member | null> {
    return this.memberRepository.findOne({
      relations: {
        branchInfo: true,
        organization: true
      },
      where: {
        name,
        passwordHash
      }
    });
  }

  async countByNameAndBranch(name: string, branch: string): Promise<number> {
    return this.memberRepository
      .createQueryBuilder("member")
      .leftJoin("member.branchInfo", "branchInfo")
      .where("member.name = :name", { name })
      .andWhere("branchInfo.name = :branch", { branch })
      .getCount();
  }

  async save(member: Member): Promise<Member> {
    return this.memberRepository.save(member);
  }

  async findPendingPreRegistrationByNameAndBranch(
    name: string,
    branch: string
  ): Promise<MemberPreRegistration | null> {
    return this.memberPreRegistrationRepository.findOne({
      relations: {
        branchInfo: true,
        organization: true
      },
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
      .leftJoin("member.organization", "organization")
      .select("organization.name", "branch")
      .addSelect("COUNT(member.id)", "memberCount")
      .where("member.isActive = true")
      .andWhere("member.roleType IN (:...roleTypes)", { roleTypes })
      .groupBy("organization.name")
      .orderBy("organization.name", "ASC")
      .getRawMany<BranchMemberCountRow>();
  }
}
