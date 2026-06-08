import { ConflictException } from "@nestjs/common";
import { MemberPosition } from "../enum/member-position.enum";

export class MemberDuplicateCredentialException extends ConflictException {
  constructor(name: string, position: MemberPosition) {
    super(`동일한 이름, 직급, 비밀번호를 사용하는 회원이 이미 존재합니다. name=${name}, position=${position}`);
  }
}
