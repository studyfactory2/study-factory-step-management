import { BadRequestException } from "@nestjs/common";

export class TaskInvalidAssigneeException extends BadRequestException {
  constructor() {
    super("단일 담당자 업무 등록에는 담당자 ID가 필요합니다.");
  }
}
