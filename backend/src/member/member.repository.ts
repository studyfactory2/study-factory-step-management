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
    return this.memberRepository.find();
  }

  async findById(id: number): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { id }
    });
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
      where: {
        isActive: true,
        roleType: Not(In([MemberRole.CEO, MemberRole.ADMIN]))
      },
      order: {
        roleType: "ASC",
        name: "ASC"
      }
    });
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

  async save(member: Member): Promise<Member> {
    return this.memberRepository.save(member);
  }

  async findPreRegistrationByNameAndRoleType(
    name: string,
    roleType: MemberRole,
    branch: string
  ): Promise<MemberPreRegistration | null> {
    return this.memberPreRegistrationRepository.findOne({
      where: {
        name,
        roleType,
        branch,
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
