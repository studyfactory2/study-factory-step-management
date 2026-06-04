import { MemberRole } from "../../member/enum/member-role.enum";

export interface CurrentMember {
  memberId: number;
  name: string;
  role: MemberRole;
}
