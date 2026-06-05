import { IsEnum, IsString } from "class-validator";
import { MemberRole } from "../enum/member-role.enum";

export class MemberPreRegisterRequest {
  @IsString({ message: "이름은 문자열이어야 합니다." })
  name: string;

  @IsEnum(MemberRole, { message: "유효하지 않은 직위입니다." })
  memberRole: MemberRole;

  @IsString({ message: "지점은 문자열이어야 합니다." })
  branch: string;
}
