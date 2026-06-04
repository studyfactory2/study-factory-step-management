import { MemberRole } from "../../member/enum/member-role.enum";

export interface CurrentMember {
  memberId: number;
  role: MemberRole;
  loginId: string;
}
