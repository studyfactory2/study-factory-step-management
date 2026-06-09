import { ConflictException } from "@nestjs/common";

export class MemberDuplicateCredentialException extends ConflictException {
  constructor(name: string) {
    super(`동일한 이름과 비밀번호를 사용하는 회원이 이미 존재합니다. name=${name}`);
  }
}
