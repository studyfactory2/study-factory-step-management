import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "./entity/member.entity";
import { MemberPreRegistration } from "./entity/member-pre-registration.entity";
import { MemberRole } from "./enum/member-role.enum";

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
    roleType: MemberRole
  ): Promise<MemberPreRegistration | null> {
    return this.memberPreRegistrationRepository.findOne({
      where: {
        name,
        roleType,
        isRegistered: false
      }
    });
  }

  async savePreRegistration(preRegistration: MemberPreRegistration): Promise<MemberPreRegistration> {
    return this.memberPreRegistrationRepository.save(preRegistration);
  }
}
