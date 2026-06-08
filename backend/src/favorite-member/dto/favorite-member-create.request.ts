import { IsInt } from "class-validator";

export class FavoriteMemberCreateRequest {
  @IsInt({ message: "직원 ID는 숫자여야 합니다." })
  memberId: number;
}
