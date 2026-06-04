import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { MemberRole } from "../../member/enum/member-role.enum";
import { CurrentMember } from "../type/current-member.type";

@Injectable()
export class AdminOrCeoGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const currentMember = context.switchToHttp().getRequest().user as CurrentMember | undefined;

    if (currentMember?.role === MemberRole.CEO || currentMember?.role === MemberRole.ADMIN) {
      return true;
    }

    throw new ForbiddenException("사전등록 권한이 없습니다.");
  }
}
