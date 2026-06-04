import { MemberRole } from "../../member/enum/member-role.enum";

export class LoginResponse {
  accessToken: string;
  member: {
    id: number;
    loginId: string;
    name: string;
    roleType: MemberRole;
  };
}
