import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { CurrentMember } from "../../auth/type/current-member.type";
import { MemberRole } from "../../member/enum/member-role.enum";

@Injectable()
export class AdminOrCeoGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const currentMember = context.switchToHttp().getRequest().user as CurrentMember | undefined;

    if (currentMember?.role === MemberRole.CEO || currentMember?.role === MemberRole.ADMIN) {
      return true;
    }

    throw new ForbiddenException("관리자 권한이 없습니다.");
  }
}
