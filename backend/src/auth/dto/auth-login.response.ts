import { MemberRole } from "../../member/enum/member-role.enum";

export class AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  member: {
    id: number;
    name: string;
    branch: string | null;
    roleType: MemberRole;
  };
}
