import { UnauthorizedException } from "@nestjs/common";

export class InvalidTokenException extends UnauthorizedException {
  constructor() {
    super("유효하지 않거나 만료된 토큰입니다.");
  }
}
