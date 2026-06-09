import { IsString } from "class-validator";

export class TaskDescriptionUpdateRequest {
  @IsString({ message: "업무 설명은 문자열이어야 합니다." })
  description: string;
}
