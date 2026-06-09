import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, ValidateNested } from "class-validator";

export class PositionTreeNodeUpdateRequest {
  @Type(() => Number)
  @IsNumber({}, { message: "직위 ID는 숫자여야 합니다." })
  id: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "상위 직위 ID는 숫자여야 합니다." })
  parentId?: number | null;

  @Type(() => Number)
  @IsNumber({}, { message: "표시 순서는 숫자여야 합니다." })
  displayOrder: number;
}

export class PositionTreeUpdateRequest {
  @IsArray({ message: "조직도 목록은 배열이어야 합니다." })
  @ValidateNested({ each: true })
  @Type(() => PositionTreeNodeUpdateRequest)
  positions: PositionTreeNodeUpdateRequest[];
}
