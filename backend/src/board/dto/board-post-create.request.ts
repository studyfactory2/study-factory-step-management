import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { BoardVisibility } from "../enum/board-visibility.enum";

export class BoardPostCreateRequest {
  @IsString()
  @MaxLength(40)
  title: string;

  @IsString()
  @MaxLength(500)
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  oneLineComment?: string;

  @IsEnum(BoardVisibility)
  @IsOptional()
  visibility?: BoardVisibility;

  @IsOptional()
  categoryIds?: string | string[];
}
