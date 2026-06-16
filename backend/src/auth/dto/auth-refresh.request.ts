import { IsString } from "class-validator";

export class AuthRefreshRequest {
  @IsString({ message: "리프레시 토큰은 문자열이어야 합니다." })
  refreshToken: string;
}
