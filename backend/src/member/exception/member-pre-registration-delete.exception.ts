import { BadRequestException } from "@nestjs/common";

export class MemberPreRegistrationDeleteException extends BadRequestException {
  constructor(id: number) {
    super(`이미 가입 완료된 사전등록 정보는 삭제할 수 없습니다. id=${id}`);
  }
}
