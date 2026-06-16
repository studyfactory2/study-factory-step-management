import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { BoardPostType } from "../enum/board-post-type.enum";
import { BoardVisibility } from "../enum/board-visibility.enum";

export class BoardPostDraftSaveRequest {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  oneLineComment?: string;

  @IsOptional()
  @IsEnum(BoardVisibility)
  visibility?: BoardVisibility;

  @IsOptional()
  @IsEnum(BoardPostType)
  postType?: BoardPostType;

  @IsOptional()
  categoryIds?: string | string[];

  @IsOptional()
  keepAttachmentIds?: string | string[];
}
