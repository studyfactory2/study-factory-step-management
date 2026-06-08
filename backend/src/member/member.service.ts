import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { MemberPreRegisterRequest } from "./dto/member-pre-register.request";
import { MemberRegisterRequest } from "./dto/member-register.request";
import { Member } from "./entity/member.entity";
import { MemberPreRegistration } from "./entity/member-pre-registration.entity";
import { MemberDuplicateCredentialException } from "./exception/member-duplicate-credential.exception";
import { MemberPreRegistrationDeleteException } from "./exception/member-pre-registration-delete.exception";
import { MemberPreRegistrationNotFoundException } from "./exception/member-pre-registration-not-found.exception";
import { MemberNotFoundException } from "./exception/member-not-found.exception";
import { MemberPositionNotFoundException } from "./exception/member-position-not-found.exception";
import { MemberRepository } from "./member.repository";
import { MemberRole } from "./enum/member-role.enum";
import { PositionRepository } from "../position/position.repository";

@Injectable()
export class MemberService {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly positionRepository: PositionRepository
  ) {}

  async findAll(): Promise<Member[]> {
    return this.memberRepository.findAll();
  }

  async findById(id: number): Promise<Member> {
    const member = await this.memberRepository.findById(id);

    if (!member) {
      throw new MemberNotFoundException(id);
    }

    return member;
  }

  async preRegister(request: MemberPreRegisterRequest): Promise<MemberPreRegistration> {
    const roleType = request.position as unknown as MemberRole;
    const preRegistration = new MemberPreRegistration();
    preRegistration.name = request.name;
    preRegistration.branch = request.branch;
    preRegistration.affiliation = request.affiliation;
    preRegistration.position = request.position;
    preRegistration.roleType = roleType;
    preRegistration.duty = request.duty;
    preRegistration.isRegistered = false;

    return this.memberRepository.savePreRegistration(preRegistration);
  }

  async findPreRegistrations(): Promise<MemberPreRegistration[]> {
    return this.memberRepository.findPreRegistrations();
  }

  async deletePreRegistration(id: number): Promise<void> {
    const preRegistration = await this.memberRepository.findPreRegistrationById(id);

    if (!preRegistration) {
      throw new MemberNotFoundException(id);
    }

    if (preRegistration.isRegistered) {
      throw new MemberPreRegistrationDeleteException(id);
    }

    await this.memberRepository.deletePreRegistration(preRegistration);
  }

  async register(request: MemberRegisterRequest): Promise<Member> {
    const preRegistration = await this.memberRepository.findPreRegistrationByNameAndRoleType(
      request.name,
      request.branch,
      request.affiliation,
      request.position,
      request.duty
    );

    if (!preRegistration) {
      throw new MemberPreRegistrationNotFoundException(
        request.name,
        request.branch,
        request.affiliation,
        request.position,
        request.duty
      );
    }

    const passwordHash = this.createPasswordHash(request.password);
    const roleType = this.resolveRoleType(request.position);
    const duplicateMember = await this.memberRepository.findByNameAndRoleTypeAndPasswordHash(
      request.name,
      roleType,
      passwordHash
    );

    if (duplicateMember) {
      throw new MemberDuplicateCredentialException(request.name, request.position);
    }

    const position = await this.positionRepository.findActiveByCode(request.position);
    if (!position) {
      throw new MemberPositionNotFoundException(request.position);
    }

    const positionDuty = await this.positionRepository.findDutyByPositionIdAndDuty(
      position.id,
      request.duty
    );
    if (!positionDuty) {
      throw new MemberPositionNotFoundException(request.position);
    }

    const member = request.toEntity(passwordHash, position.id, positionDuty.id, roleType);

    preRegistration.isRegistered = true;
    await this.memberRepository.savePreRegistration(preRegistration);

    return this.memberRepository.save(member);
  }

  private createPasswordHash(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }

  private resolveRoleType(position: string): MemberRole {
    if (position === MemberRole.CEO) {
      return MemberRole.CEO;
    }

    if (position === MemberRole.ADMIN) {
      return MemberRole.ADMIN;
    }

    return MemberRole.EMPLOYEE;
  }
}
