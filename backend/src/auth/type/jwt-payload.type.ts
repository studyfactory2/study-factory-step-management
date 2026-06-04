import { MemberRole } from "../../member/enum/member-role.enum";
import { AuthTokenType } from "../enum/auth-token-type.enum";

export type JwtPayload = {
  userId: number;
  name: string;
  roleType: MemberRole;
  tokenType: AuthTokenType;
};
