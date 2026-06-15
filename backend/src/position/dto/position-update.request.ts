import { IsOptional, IsString } from "class-validator";

export class PositionUpdateRequest {
  @IsOptional()
  @IsString({ message: "직위명은 문자열이어야 합니다." })
  name?: string;
}
