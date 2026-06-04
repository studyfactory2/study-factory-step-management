import { ConflictException } from "@nestjs/common";
import { MemberRole } from "../enum/member-role.enum";

export class MemberDuplicateCredentialException extends ConflictException {
  constructor(name: string, memberRole: MemberRole) {
    super(`동일한 이름, 직위, 비밀번호를 사용하는 회원이 이미 존재합니다. name=${name}, memberRole=${memberRole}`);
  }
}
