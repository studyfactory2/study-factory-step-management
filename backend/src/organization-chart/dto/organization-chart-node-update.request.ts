import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class OrganizationChartNodeUpdateRequest {
  @IsOptional()
  @IsInt()
  id: number;

  @IsOptional()
  @IsInt()
  parentId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  parentSlotKey?: string | null;

  @IsInt()
  floor: number;

  @IsString()
  @MaxLength(120)
  slotKey: string;

  @IsInt()
  displayOrder: number;

  @IsBoolean()
  isEnabled: boolean;

  @IsOptional()
  @IsInt()
  organizationId?: number | null;

  @IsOptional()
  @IsInt()
  positionId?: number | null;

  @IsOptional()
  @IsInt()
  memberId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string | null;
}
