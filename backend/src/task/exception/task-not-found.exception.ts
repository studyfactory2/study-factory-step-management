import { NotFoundException } from "@nestjs/common";

export class TaskNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`업무를 찾을 수 없습니다. id=${id}`);
  }
}
