import { IsString, Length } from "class-validator";

export class AuthLoginRequest {
  @IsString({ message: "이름은 문자열이어야 합니다." })
  name: string;

  @IsString({ message: "비밀번호는 문자열이어야 합니다." })
  @Length(4, 4, { message: "비밀번호는 반드시 4자여야 합니다." })
  password: string;
}
