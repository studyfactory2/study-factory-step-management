import { MemberRole } from "../enum/member-role.enum";

export class CreateMemberRequest {
  loginId: string;
  name: string;
  password: string;
  roleType: MemberRole;
}
