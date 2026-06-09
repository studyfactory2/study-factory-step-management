import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class MemberPreRegisterRequest {
  @IsString({ message: "이름은 문자열이어야 합니다." })
  name: string;

  @IsString({ message: "지점은 문자열이어야 합니다." })
  branch: string;

  @Type(() => Number)
  @IsNumber({}, { message: "직위 ID는 숫자여야 합니다." })
  positionId: number;

  @Type(() => Number)
  @IsNumber({}, { message: "역할 ID는 숫자여야 합니다." })
  positionDutyId: number;
}
