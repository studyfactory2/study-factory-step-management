import { type PositionTreeNode } from "@/api/position";

export type FlatPosition = PositionTreeNode & {
  depth: number;
};

export type DropdownOption = {
  depth?: number;
  label: string;
  value: string;
};

export type PreRegistrationEditDraft = {
  age: string;
  dutyText: string;
  joinedAt: string;
  name: string;
  organization: string;
  phoneNumber: string;
  positionId: string;
  residenceCity: string;
  residenceDistrict: string;
};
