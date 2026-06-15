import type { Member } from "@/types/domain";

export type OrganizationGroup = {
  members: Member[];
  organizationName: string;
};

export type PositionGroup = {
  members: Member[];
  positionName: string;
};
