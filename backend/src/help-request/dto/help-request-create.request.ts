import { Type } from "class-transformer";
import { IsNumber, IsString, MinLength } from "class-validator";
import { HelpRequest } from "../entity/help-request.entity";

export class HelpRequestCreateRequest {
  @Type(() => Number)
  @IsNumber({}, { message: "업무 ID는 숫자여야 합니다." })
  taskId: number;

  @Type(() => Number)
  @IsNumber({}, { message: "도움을 요청할 사원 ID는 숫자여야 합니다." })
  receiverId: number;

  @IsString({ message: "요청내용은 문자열이어야 합니다." })
  @MinLength(1, { message: "요청내용을 입력해주세요." })
  content: string;

  toEntity(requesterId: number): HelpRequest {
    const helpRequest = new HelpRequest();
    helpRequest.taskId = this.taskId;
    helpRequest.receiverId = this.receiverId;
    helpRequest.requesterId = requesterId;
    helpRequest.content = this.content;

    return helpRequest;
  }
}
