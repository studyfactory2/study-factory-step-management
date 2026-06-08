import { IsEnum, IsString } from "class-validator";
import { MemberAffiliation } from "../enum/member-affiliation.enum";
import { MemberDuty } from "../enum/member-duty.enum";
import { MemberPosition } from "../enum/member-position.enum";

export class MemberPreRegisterRequest {
  @IsString({ message: "이름은 문자열이어야 합니다." })
  name: string;

  @IsString({ message: "지점은 문자열이어야 합니다." })
  branch: string;

  @IsEnum(MemberAffiliation, { message: "유효하지 않은 소속입니다." })
  affiliation: MemberAffiliation;

  @IsEnum(MemberPosition, { message: "유효하지 않은 직급입니다." })
  position: MemberPosition;

  @IsEnum(MemberDuty, { message: "유효하지 않은 역할입니다." })
  duty: MemberDuty;
}
