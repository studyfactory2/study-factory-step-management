import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { BoardPostType } from "../enum/board-post-type.enum";
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

  @IsEnum(BoardPostType)
  @IsOptional()
  postType?: BoardPostType;

  @IsOptional()
  categoryIds?: string | string[];
}
