import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { MemberPreRegisterRequest } from "./dto/member-pre-register.request";
import { MemberRegisterRequest } from "./dto/member-register.request";
import { OrganizationUpdateRequest } from "./dto/organization-update.request";
import { Member } from "./entity/member.entity";
import { MemberPreRegistration } from "./entity/member-pre-registration.entity";
import { Organization } from "./entity/organization.entity";
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

  async findBranches(): Promise<string[]> {
    return this.memberRepository.findBranches();
  }

  async findOrganizations() {
    const organizations = await this.memberRepository.findOrganizations();

    return organizations.map((organization) => ({
      colorIndex: organization.colorIndex,
      displayOrder: organization.displayOrder,
      id: organization.id,
      name: organization.name
    }));
  }

  async updateOrganizations(request: OrganizationUpdateRequest) {
    const savedOrganizations = await this.memberRepository.findAllOrganizations();
    const savedById = new Map(savedOrganizations.map((organization) => [organization.id, organization]));
    const requestIds = new Set(
      request.organizations
        .map((organization) => organization.id)
        .filter((id): id is number => typeof id === "number" && id > 0)
    );

    const nextOrganizations = request.organizations.map((organizationRequest, index) => {
      const trimmedName = organizationRequest.name.trim();
      const organization = organizationRequest.id
        ? savedById.get(organizationRequest.id) ?? new Organization()
        : new Organization();

      organization.name = trimmedName;
      organization.colorIndex = organizationRequest.colorIndex ?? null;
      organization.displayOrder = organizationRequest.displayOrder;
      organization.isActive = true;

      return organization;
    });

    for (const organization of savedOrganizations) {
      if (!requestIds.has(organization.id)) {
        organization.isActive = false;
        nextOrganizations.push(organization);
      }
    }

    await this.memberRepository.saveOrganizations(nextOrganizations);

    return this.findOrganizations();
  }

  async preRegister(request: MemberPreRegisterRequest): Promise<MemberPreRegistration> {
    const positionInfo = await this.positionRepository.findActiveById(request.positionId);
    if (!positionInfo) {
      throw new MemberPositionNotFoundException(String(request.positionId));
    }

    const positionDuty = request.positionDutyId
      ? await this.positionRepository.findDutyByIdAndPositionId(
        request.positionDutyId,
        request.positionId
      )
      : null;
    if (request.positionDutyId && !positionDuty) {
      throw new MemberPositionNotFoundException(String(request.positionId));
    }

    const roleType = this.resolveRoleType(positionInfo);
    const organizationInfo = request.organization
      ? await this.memberRepository.findOrganizationByName(request.organization)
      : null;
    const preRegistration = new MemberPreRegistration();
    preRegistration.name = request.name;
    preRegistration.age = request.age ?? null;
    preRegistration.joinedAt = request.joinedAt ?? null;
    preRegistration.phoneNumber = request.phoneNumber ?? null;
    preRegistration.dutyText = request.dutyText ?? null;
    preRegistration.residenceCity = request.residenceCity;
    preRegistration.residenceDistrict = request.residenceDistrict;
    preRegistration.branch = null;
    preRegistration.organizationId = organizationInfo?.id ?? null;
    preRegistration.branchId = null;
    preRegistration.affiliation = null;
    preRegistration.position = null;
    preRegistration.roleType = roleType;
    preRegistration.duty = null;
    preRegistration.positionId = positionInfo.id;
    preRegistration.positionDutyId = positionDuty?.id ?? null;
    preRegistration.isRegistered = false;

    return this.memberRepository.savePreRegistration(preRegistration);
  }

  async findPreRegistrations(): Promise<MemberPreRegistration[]> {
    return this.memberRepository.findPreRegistrations();
  }

  async updatePreRegistration(id: number, request: MemberPreRegisterRequest): Promise<MemberPreRegistration> {
    const preRegistration = await this.memberRepository.findPreRegistrationById(id);

    if (!preRegistration) {
      throw new MemberNotFoundException(id);
    }

    if (preRegistration.isRegistered) {
      throw new MemberPreRegistrationDeleteException(id);
    }

    const positionInfo = await this.positionRepository.findActiveById(request.positionId);
    if (!positionInfo) {
      throw new MemberPositionNotFoundException(String(request.positionId));
    }

    const positionDuty = request.positionDutyId
      ? await this.positionRepository.findDutyByIdAndPositionId(
        request.positionDutyId,
        request.positionId
      )
      : null;
    if (request.positionDutyId && !positionDuty) {
      throw new MemberPositionNotFoundException(String(request.positionId));
    }

    const roleType = this.resolveRoleType(positionInfo);
    const organizationInfo = request.organization
      ? await this.memberRepository.findOrganizationByName(request.organization)
      : null;

    preRegistration.name = request.name;
    preRegistration.age = request.age ?? null;
    preRegistration.joinedAt = request.joinedAt ?? null;
    preRegistration.phoneNumber = request.phoneNumber ?? null;
    preRegistration.dutyText = request.dutyText ?? null;
    preRegistration.residenceCity = request.residenceCity;
    preRegistration.residenceDistrict = request.residenceDistrict;
    preRegistration.branch = null;
    preRegistration.organizationId = organizationInfo?.id ?? null;
    preRegistration.branchId = null;
    preRegistration.affiliation = null;
    preRegistration.position = null;
    preRegistration.roleType = roleType;
    preRegistration.duty = null;
    preRegistration.positionId = positionInfo.id;
    preRegistration.positionDutyId = positionDuty?.id ?? null;

    return this.memberRepository.savePreRegistration(preRegistration);
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
    const preRegistration = await this.memberRepository.findPendingPreRegistrationByName(request.name);

    if (!preRegistration) {
      throw new MemberPreRegistrationNotFoundException(request.name);
    }

    const { organizationId, positionId, positionDutyId } = preRegistration;
    if (!positionId) {
      throw new MemberPreRegistrationNotFoundException(request.name);
    }

    const passwordHash = this.createPasswordHash(request.password);
    const duplicateMember = await this.memberRepository.findByNameAndPasswordHash(
      request.name,
      passwordHash
    );

    if (duplicateMember) {
      throw new MemberDuplicateCredentialException(request.name);
    }

    const position = await this.positionRepository.findActiveById(positionId);
    if (!position) {
      throw new MemberPositionNotFoundException(String(positionId));
    }

    const positionDuty = positionDutyId
      ? await this.positionRepository.findDutyByIdAndPositionId(
        positionDutyId,
        position.id,
      )
      : null;
    if (positionDutyId && !positionDuty) {
      throw new MemberPositionNotFoundException(String(positionId));
    }

    const roleType = this.resolveRoleType(position);
    const displayName = await this.createDisplayName(request.name);
    const member = request.toEntity(
      passwordHash,
      displayName,
      organizationId,
      null,
      position.id,
      positionDuty?.id ?? null,
      roleType
    );
    member.age = preRegistration.age;
    member.joinedAt = preRegistration.joinedAt;
    member.phoneNumber = preRegistration.phoneNumber;
    member.dutyText = preRegistration.dutyText;
    member.residenceCity = preRegistration.residenceCity;
    member.residenceDistrict = preRegistration.residenceDistrict;

    preRegistration.isRegistered = true;
    await this.memberRepository.savePreRegistration(preRegistration);

    return this.memberRepository.save(member);
  }

  private createPasswordHash(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }

  private async createDisplayName(name: string): Promise<string> {
    const sameNameMemberCount = await this.memberRepository.countByName(name);

    if (sameNameMemberCount === 0) {
      return name;
    }

    return `${name}${sameNameMemberCount + 1}`;
  }

  private resolveRoleType(position: { isAdmin: boolean; name: string }): MemberRole {
    if (position.isAdmin && position.name === "대표") {
      return MemberRole.CEO;
    }

    if (position.isAdmin) {
      return MemberRole.ADMIN;
    }

    return MemberRole.EMPLOYEE;
  }
}
