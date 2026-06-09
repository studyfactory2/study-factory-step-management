import { IsArray, IsInt } from "class-validator";

export class FavoriteMemberReorderRequest {
  @IsArray({ message: "직원 순서는 배열이어야 합니다." })
  @IsInt({ each: true, message: "직원 ID는 숫자여야 합니다." })
  memberIds: number[];
}
