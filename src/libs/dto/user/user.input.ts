import { UserRole } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString, Length } from "class-validator";

export class LoginInput {
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  loginId: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
