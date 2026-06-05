import { BadRequestException } from "@nestjs/common";
import { MemberAffiliation } from "../enum/member-affiliation.enum";
import { MemberDuty } from "../enum/member-duty.enum";
import { MemberPosition } from "../enum/member-position.enum";

export class MemberPreRegistrationNotFoundException extends BadRequestException {
  constructor(
    name: string,
    branch: string,
    affiliation: MemberAffiliation,
    position: MemberPosition,
    duty: MemberDuty
  ) {
    super(
      `사전등록된 회원 정보가 없습니다. name=${name}, branch=${branch}, affiliation=${affiliation}, position=${position}, duty=${duty}`
    );
  }
}
