import { IsEnum, IsString, Length } from "class-validator";
import { MemberRole } from "../../member/enum/member-role.enum";

export class AuthLoginRequest {
  @IsString({ message: "이름은 문자열이어야 합니다." })
  name: string;

  @IsEnum(MemberRole, { message: "유효하지 않은 직위입니다." })
  memberRole: MemberRole;

  @Length(4, 4, { message: "비밀번호는 반드시 4자여야 합니다." })
  password: string;
}
