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
  dutyText: string;
  joinedAt: string;
  name: string;
  organization: string;
  positionId: string;
};
