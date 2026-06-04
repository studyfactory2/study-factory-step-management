import { BadRequestException } from "@nestjs/common";
import { MemberRole } from "../enum/member-role.enum";

export class MemberPreRegistrationNotFoundException extends BadRequestException {
  constructor(name: string, memberRole: MemberRole) {
    super(`사전등록된 회원 정보가 없습니다. name=${name}, memberRole=${memberRole}`);
  }
}
