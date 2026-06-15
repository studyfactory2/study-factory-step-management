import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class OrganizationUpdateItemRequest {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "부서 ID는 숫자여야 합니다." })
  id?: number;

  @IsString({ message: "부서 이름은 문자열이어야 합니다." })
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "색상 번호는 숫자여야 합니다." })
  @Min(0, { message: "색상 번호는 0 이상이어야 합니다." })
  colorIndex?: number | null;

  @Type(() => Number)
  @IsNumber({}, { message: "표시 순서는 숫자여야 합니다." })
  @Min(0, { message: "표시 순서는 0 이상이어야 합니다." })
  displayOrder: number;
}

export class OrganizationUpdateRequest {
  @IsArray({ message: "부서 목록은 배열이어야 합니다." })
  @ValidateNested({ each: true })
  @Type(() => OrganizationUpdateItemRequest)
  organizations: OrganizationUpdateItemRequest[];
}
