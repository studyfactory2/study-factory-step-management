import { NotFoundException } from "@nestjs/common";

export class MemberPositionNotFoundException extends NotFoundException {
  constructor(position: number | string) {
    super(`직위 정보를 찾을 수 없습니다. position=${position}`);
  }
}
