import { IsEnum, IsString, Length } from "class-validator";
import { Member } from "../entity/member.entity";
import { MemberRole } from "../enum/member-role.enum";

export class MemberRegisterRequest {
  @IsString({ message: "이름은 문자열이어야 합니다." })
  name: string;

  @Length(4, 4, { message: "비밀번호는 반드시 4자여야 합니다." })
  password: string;

  @IsEnum(MemberRole, { message: "유효하지 않은 직위입니다." })
  memberRole: MemberRole;

  @IsString({ message: "지점은 문자열이어야 합니다." })
  branch: string;

  toEntity(passwordHash: string): Member {
    const member = new Member();
    member.name = this.name;
    member.roleType = this.memberRole;
    member.passwordHash = passwordHash;
    member.avatarUrl = null;
    member.branch = this.branch;
    member.isActive = true;

    return member;
  }
}
