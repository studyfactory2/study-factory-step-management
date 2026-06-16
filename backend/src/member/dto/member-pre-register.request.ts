import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class MemberPreRegisterRequest {
  @IsString({ message: "이름은 문자열이어야 합니다." })
  name: string;

  @IsDateString({}, { message: "입사일은 날짜 형식이어야 합니다." })
  joinedAt: string;

  @IsString({ message: "소속은 문자열이어야 합니다." })
  organization: string;

  @Type(() => Number)
  @IsNumber({}, { message: "직위 ID는 숫자여야 합니다." })
  positionId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "역할 ID는 숫자여야 합니다." })
  positionDutyId?: number;

  @IsString({ message: "담당업무는 문자열이어야 합니다." })
  dutyText: string;
}
