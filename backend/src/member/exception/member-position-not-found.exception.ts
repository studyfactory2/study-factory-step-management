import { NotFoundException } from "@nestjs/common";
import { MemberPosition } from "../enum/member-position.enum";

export class MemberPositionNotFoundException extends NotFoundException {
  constructor(position: MemberPosition) {
    super(`직위 정보를 찾을 수 없습니다. position=${position}`);
  }
}
