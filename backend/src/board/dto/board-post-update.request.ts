import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { BoardVisibility } from "../enum/board-visibility.enum";

export class BoardPostUpdateRequest {
  @IsString()
  @IsOptional()
  @MaxLength(40)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  content?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  oneLineComment?: string;

  @IsEnum(BoardVisibility)
  @IsOptional()
  visibility?: BoardVisibility;
}
