import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticationException } from "../exception/authentication.exception";
import { CurrentMember as CurrentMemberType } from "../type/current-member.type";

export const CurrentMember = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const requestingMember = ctx.switchToHttp().getRequest().user;

    if (!requestingMember) {
      throw new AuthenticationException("인증 정보가 없습니다.");
    }

    if (!isCurrentMember(requestingMember)) {
      throw new AuthenticationException("유효하지 않은 인증 정보입니다.");
    }

    return requestingMember;
  }
);

function isCurrentMember(obj: unknown): obj is CurrentMemberType {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "memberId" in obj &&
    "name" in obj &&
    "role" in obj &&
    typeof (obj as CurrentMemberType).memberId === "number" &&
    typeof (obj as CurrentMemberType).name === "string" &&
    typeof (obj as CurrentMemberType).role === "string"
  );
}
