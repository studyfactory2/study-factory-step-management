import { NotFoundException } from "@nestjs/common";

export class MemberNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Member not found. id=${id}`);
  }
}
