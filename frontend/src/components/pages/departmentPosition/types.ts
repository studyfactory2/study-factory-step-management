import { type PositionTreeNode } from "@/api/position";
import { type OrganizationOption } from "@/api/member";

export type FlatPosition = PositionTreeNode & {
  depth: number;
};

export type DropPlacement = "before" | "inside" | "after";

export type PositionDropPreview = {
  placement: DropPlacement;
  targetId: number;
};

export type DepartmentOption = OrganizationOption & {
  colorIndex?: number;
};
