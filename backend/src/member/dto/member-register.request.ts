import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, IsString, Length } from "class-validator";
import { Member } from "../entity/member.entity";
import { MemberRole } from "../enum/member-role.enum";

export class MemberRegisterRequest {
  @IsString({ message: "이름은 문자열이어야 합니다." })
  name: string;

  @Length(4, 4, { message: "비밀번호는 반드시 4자여야 합니다." })
  password: string;

  @IsOptional()
  @IsString({ message: "프로필 사진 URL은 문자열이어야 합니다." })
  avatarUrl?: string;

  @IsString({ message: "소속은 문자열이어야 합니다." })
  organization: string;

  @Type(() => Number)
  @IsNumber({}, { message: "직위 ID는 숫자여야 합니다." })
  positionId: number;

  @IsString({ message: "전화번호는 문자열이어야 합니다." })
  phoneNumber: string;

  @IsDateString({}, { message: "생년월일은 날짜 형식이어야 합니다." })
  birthDate: string;

  @IsString({ message: "거주지 시/도는 문자열이어야 합니다." })
  residenceCity: string;

  @IsString({ message: "거주지 시/군/구는 문자열이어야 합니다." })
  residenceDistrict: string;

  toEntity(
    passwordHash: string,
    displayName: string,
    organizationId: number | null,
    branchId: number | null,
    positionId: number,
    positionDutyId: number | null,
    roleType: MemberRole
  ): Member {
    const member = new Member();
    member.name = this.name;
    member.displayName = displayName;
    member.roleType = roleType;
    member.positionId = positionId;
    member.positionDutyId = positionDutyId;
    member.passwordHash = passwordHash;
    member.avatarUrl = this.avatarUrl?.trim() || null;
    member.birthDate = this.birthDate;
    member.joinedAt = null;
    member.phoneNumber = this.phoneNumber;
    member.dutyText = null;
    member.residenceCity = this.residenceCity;
    member.residenceDistrict = this.residenceDistrict;
    member.organizationId = organizationId;
    member.branchId = branchId;
    member.isActive = true;

    return member;
  }
}
