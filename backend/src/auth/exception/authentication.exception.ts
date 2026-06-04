import { UnauthorizedException } from "@nestjs/common";

export class AuthenticationException extends UnauthorizedException {
  constructor(message = "인증에 실패했습니다.") {
    super(message);
  }
}
