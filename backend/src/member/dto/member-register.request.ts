import { IsString, Length } from "class-validator";
import { Member } from "../entity/member.entity";
import { MemberRole } from "../enum/member-role.enum";

export class MemberRegisterRequest {
  @IsString({ message: "이름은 문자열이어야 합니다." })
  name: string;

  @Length(4, 4, { message: "비밀번호는 반드시 4자여야 합니다." })
  password: string;

  toEntity(
    passwordHash: string,
    displayName: string,
    organizationId: number | null,
    branchId: number | null,
    positionId: number,
    positionDutyId: number | null,
    roleType: MemberRole
  ): Member {
    const member = new Member();
    member.name = this.name;
    member.displayName = displayName;
    member.roleType = roleType;
    member.positionId = positionId;
    member.positionDutyId = positionDutyId;
    member.passwordHash = passwordHash;
    member.avatarUrl = null;
    member.age = null;
    member.joinedAt = null;
    member.phoneNumber = null;
    member.dutyText = null;
    member.residenceCity = null;
    member.residenceDistrict = null;
    member.organizationId = organizationId;
    member.branchId = branchId;
    member.isActive = true;

    return member;
  }
}
