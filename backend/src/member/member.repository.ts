import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Not, Repository } from "typeorm";
import { Member } from "./entity/member.entity";
import { MemberPreRegistration } from "./entity/member-pre-registration.entity";
import { MemberAffiliation } from "./enum/member-affiliation.enum";
import { MemberDuty } from "./enum/member-duty.enum";
import { MemberPosition } from "./enum/member-position.enum";
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
      order: {
        isRegistered: "ASC",
        createdAt: "DESC"
      }
    });
  }

  async findPreRegistrationById(id: number): Promise<MemberPreRegistration | null> {
    return this.memberPreRegistrationRepository.findOne({
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
        roleType: Not(In([MemberRole.CEO, MemberRole.ADMIN]))
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
        roleTypes: [MemberRole.CEO, MemberRole.ADMIN]
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

  async findActiveByPositionCodes(positionCodes: string[]): Promise<Member[]> {
    return this.memberRepository
      .createQueryBuilder("member")
      .leftJoinAndSelect("member.positionInfo", "position")
      .leftJoinAndSelect("member.positionDuty", "positionDuty")
      .where("member.isActive = true")
      .andWhere("position.code IN (:...positionCodes)", { positionCodes })
      .orderBy("position.displayOrder", "ASC")
      .addOrderBy("member.name", "ASC")
      .getMany();
  }

  async countActiveMembersByBranchAndPositionCodes(positionCodes: string[]): Promise<BranchMemberCountRow[]> {
    return this.memberRepository
      .createQueryBuilder("member")
      .leftJoin("member.positionInfo", "position")
      .select("member.branch", "branch")
      .addSelect("COUNT(member.id)", "memberCount")
      .where("member.isActive = true")
      .andWhere("position.code IN (:...positionCodes)", { positionCodes })
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

  async save(member: Member): Promise<Member> {
    return this.memberRepository.save(member);
  }

  async findPreRegistrationByNameAndRoleType(
    name: string,
    branch: string,
    affiliation: MemberAffiliation,
    position: MemberPosition,
    duty: MemberDuty
  ): Promise<MemberPreRegistration | null> {
    return this.memberPreRegistrationRepository.findOne({
      where: {
        name,
        branch,
        affiliation,
        position,
        duty,
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
