import { BadRequestException } from "@nestjs/common";

export class MemberPreRegistrationNotFoundException extends BadRequestException {
  constructor(name: string, branch?: string) {
    super(
      branch
        ? `사전등록된 회원 정보가 없습니다. name=${name}, branch=${branch}`
        : `사전등록된 회원 정보가 없습니다. name=${name}`
    );
  }
}
