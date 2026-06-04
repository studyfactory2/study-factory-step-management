import { UserRole } from "@prisma/client";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";

export class CreateUserInput {
  @IsString()
  @Length(1, 30)
  loginId: string;

  @IsString()
  @Length(1, 50)
  name: string;

  @IsString()
  @Length(4, 100)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  department?: string;
}
