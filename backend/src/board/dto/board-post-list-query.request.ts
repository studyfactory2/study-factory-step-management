import { IsEnum, IsOptional } from "class-validator";
import { BoardPostType } from "../enum/board-post-type.enum";

export class BoardPostListQueryRequest {
  @IsEnum(BoardPostType)
  @IsOptional()
  type?: BoardPostType;
}
