import { NotFoundException } from "@nestjs/common";

export class MemberNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`회원을 찾을 수 없습니다. id=${id}`);
  }
}
