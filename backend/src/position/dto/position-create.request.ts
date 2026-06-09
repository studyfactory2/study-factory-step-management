import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class PositionCreateRequest {
  @IsString({ message: "직위명은 문자열이어야 합니다." })
  name: string;

  @IsOptional()
  @IsString({ message: "역할 설명은 문자열이어야 합니다." })
  subtitle?: string;

  @IsOptional()
  @IsString({ message: "담당 역할은 문자열이어야 합니다." })
  duty?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "상위 직위 ID는 숫자여야 합니다." })
  parentId?: number | null;

  @IsOptional()
  @IsBoolean({ message: "로그인 화면 표시 여부는 참/거짓이어야 합니다." })
  isLoginVisible?: boolean;

  @IsOptional()
  @IsBoolean({ message: "관리자 직위 여부는 참/거짓이어야 합니다." })
  isAdmin?: boolean;
}
