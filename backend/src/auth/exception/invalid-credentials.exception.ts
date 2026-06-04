import { UnauthorizedException } from "@nestjs/common";

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super("아이디 또는 비밀번호가 올바르지 않습니다.");
  }
}
