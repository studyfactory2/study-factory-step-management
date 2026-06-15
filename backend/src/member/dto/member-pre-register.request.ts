import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class MemberPreRegisterRequest {
  @IsString({ message: "이름은 문자열이어야 합니다." })
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "나이는 숫자여야 합니다." })
  @Min(1, { message: "나이는 1 이상이어야 합니다." })
  age?: number;

  @IsOptional()
  @IsDateString({}, { message: "입사일은 날짜 형식이어야 합니다." })
  joinedAt?: string;

  @IsOptional()
  @IsString({ message: "전화번호는 문자열이어야 합니다." })
  phoneNumber?: string;

  @IsString({ message: "지점은 문자열이어야 합니다." })
  branch: string;

  @IsOptional()
  @IsString({ message: "소속은 문자열이어야 합니다." })
  organization?: string;

  @Type(() => Number)
  @IsNumber({}, { message: "직위 ID는 숫자여야 합니다." })
  positionId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "역할 ID는 숫자여야 합니다." })
  positionDutyId?: number;

  @IsOptional()
  @IsString({ message: "담당업무는 문자열이어야 합니다." })
  dutyText?: string;
}
