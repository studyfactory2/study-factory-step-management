import { MemberRole } from "../../member/enum/member-role.enum";

export class AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  member: {
    id: number;
    name: string;
    branch: string | null;
    organizationId: number | null;
    organizationName: string | null;
    branchId: number | null;
    branchName: string | null;
    positionName: string | null;
    roleType: MemberRole;
  };
}
