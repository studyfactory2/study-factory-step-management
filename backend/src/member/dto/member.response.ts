import { MemberAffiliation } from "../enum/member-affiliation.enum";
import { MemberDuty } from "../enum/member-duty.enum";
import { MemberPosition } from "../enum/member-position.enum";
import { MemberRole } from "../enum/member-role.enum";

export class MemberResponse {
  id: number;
  name: string;
  avatarUrl: string | null;
  branch: string | null;
  affiliation: MemberAffiliation | null;
  position: MemberPosition | null;
  positionId: number | null;
  roleType: MemberRole;
  duty: MemberDuty | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
