import { IsEnum, IsString, Length } from "class-validator";
import { Member } from "../entity/member.entity";
import { MemberAffiliation } from "../enum/member-affiliation.enum";
import { MemberDuty } from "../enum/member-duty.enum";
import { MemberPosition } from "../enum/member-position.enum";
import { MemberRole } from "../enum/member-role.enum";

export class MemberRegisterRequest {
  @IsString({ message: "이름은 문자열이어야 합니다." })
  name: string;

  @Length(4, 4, { message: "비밀번호는 반드시 4자여야 합니다." })
  password: string;

  @IsString({ message: "지점은 문자열이어야 합니다." })
  branch: string;

  @IsEnum(MemberAffiliation, { message: "유효하지 않은 소속입니다." })
  affiliation: MemberAffiliation;

  @IsEnum(MemberPosition, { message: "유효하지 않은 직급입니다." })
  position: MemberPosition;

  @IsEnum(MemberDuty, { message: "유효하지 않은 역할입니다." })
  duty: MemberDuty;

  toEntity(passwordHash: string): Member {
    const member = new Member();
    member.name = this.name;
    member.roleType = this.position as unknown as MemberRole;
    member.position = this.position;
    member.affiliation = this.affiliation;
    member.passwordHash = passwordHash;
    member.avatarUrl = null;
    member.branch = this.branch;
    member.duty = this.duty;
    member.isActive = true;

    return member;
  }
}
