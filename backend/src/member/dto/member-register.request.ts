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
    branch: string,
    displayName: string,
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
    member.branch = branch;
    member.isActive = true;

    return member;
  }
}
