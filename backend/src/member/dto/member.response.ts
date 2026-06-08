import { MemberRole } from "../enum/member-role.enum";

export class MemberResponse {
  id: number;
  name: string;
  avatarUrl: string | null;
  branch: string | null;
  positionId: number | null;
  positionDutyId: number | null;
  roleType: MemberRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
