import { MemberRole } from "../enum/member-role.enum";

export class MemberResponse {
  id: number;
  loginId: string;
  name: string;
  avatarUrl: string | null;
  roleType: MemberRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
