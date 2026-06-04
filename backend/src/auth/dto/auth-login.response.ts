import { MemberRole } from "../../member/enum/member-role.enum";

export class AuthLoginResponse {
  accessToken: string;
  member: {
    id: number;
    name: string;
    roleType: MemberRole;
  };
}
