import { type DragEvent } from "react";
import {
  type LucideIcon,
  Building2,
  Crown,
  Factory,
  FlaskConical,
  UserRound,
  Wrench
} from "lucide-react";
import { type PositionTreeNode } from "@/api/position";
import { colorSwatches } from "./constants";
import { type DropPlacement, type FlatPosition } from "./types";

export function getDepartmentMeta(name: string, index: number, colorIndex?: number): {
  className: string;
  icon: LucideIcon;
} {
  if (typeof colorIndex === "number") {
    return {
      className: colorSwatches[colorIndex]?.rowClassName ?? colorSwatches[0].rowClassName,
      icon: Building2
    };
  }

  if (name.includes("자격증")) {
    return {
      className: "border-[#F0C5C5] bg-[#FFF1F1]",
      icon: Factory
    };
  }

  if (name.includes("수험생")) {
    return {
      className: "border-[#B9D7EF] bg-[#F3FAFF]",
      icon: Building2
    };
  }

  return {
    className: colorSwatches[(index + 1) % colorSwatches.length].rowClassName,
    icon: Building2
  };
}

export function resolveDepartmentColorIndex(name: string, index: number) {
  if (name.includes("자격증")) {
    return 0;
  }

  if (name.includes("수험생")) {
    return 2;
  }

  return (index + 1) % colorSwatches.length;
}

export function isTemporaryDepartmentId(id: number) {
  return id > 1_000_000_000_000;
}

export function resolveDropPlacement(event: DragEvent<HTMLElement>): DropPlacement {
  const bounds = event.currentTarget.getBoundingClientRect();
  const offsetY = event.clientY - bounds.top;
  const third = bounds.height / 3;

  if (offsetY < third) {
    return "before";
  }

  if (offsetY > third * 2) {
    return "after";
  }

  return "inside";
}

export function movePositionDraft(
  positions: FlatPosition[],
  draggedPositionId: number,
  targetPositionId: number,
  placement: DropPlacement
) {
  const targetPosition = positions.find((position) => position.id === targetPositionId);
  if (!targetPosition || isPositionDescendant(targetPositionId, draggedPositionId, positions)) {
    return positions;
  }

  const nextParentId = placement === "inside" ? targetPositionId : targetPosition.parentId ?? null;
  const movedPositions = positions.map((position) => (
    position.id === draggedPositionId
      ? {
        ...position,
        parentId: nextParentId
      }
      : position
  ));
  const draggedSubtreeIds = getPositionSubtreeIds(draggedPositionId, movedPositions);
  const visibleOrder = buildVisiblePositionTree(movedPositions);
  const movingRows = visibleOrder.filter((position) => draggedSubtreeIds.has(position.id));
  const remainingRows = visibleOrder.filter((position) => !draggedSubtreeIds.has(position.id));
  const targetIndex = remainingRows.findIndex((position) => position.id === targetPositionId);

  if (targetIndex < 0 || movingRows.length === 0) {
    return movedPositions;
  }

  const targetSubtreeIds = getPositionSubtreeIds(targetPositionId, movedPositions);
  const insertionIndex = placement === "before"
    ? targetIndex
    : placement === "inside"
      ? targetIndex + 1
      : findLastSubtreeIndex(remainingRows, targetSubtreeIds) + 1;
  const nextOrder = [
    ...remainingRows.slice(0, insertionIndex),
    ...movingRows,
    ...remainingRows.slice(insertionIndex)
  ];
  const displayOrderById = new Map(nextOrder.map((position, index) => [position.id, index]));

  return movedPositions.map((position) => ({
    ...position,
    displayOrder: displayOrderById.get(position.id) ?? position.displayOrder
  }));
}

export function getPositionSubtreeIds(positionId: number, positions: FlatPosition[]) {
  const subtreeIds = new Set<number>([positionId]);
  let hasAddedChild = true;

  while (hasAddedChild) {
    hasAddedChild = false;

    for (const position of positions) {
      if (position.parentId && subtreeIds.has(position.parentId) && !subtreeIds.has(position.id)) {
        subtreeIds.add(position.id);
        hasAddedChild = true;
      }
    }
  }

  return subtreeIds;
}

export function findLastSubtreeIndex(positions: FlatPosition[], subtreeIds: Set<number>) {
  let lastIndex = -1;

  positions.forEach((position, index) => {
    if (subtreeIds.has(position.id)) {
      lastIndex = index;
    }
  });

  return lastIndex;
}

export function buildVisiblePositionTree(positions: FlatPosition[]): FlatPosition[] {
  const activeNonAdminPositions = positions
    .filter((position) => position.isActive && !position.isAdmin)
    .sort((left, right) => left.displayOrder - right.displayOrder || left.id - right.id);
  const visibleIdSet = new Set(activeNonAdminPositions.map((position) => position.id));
  const childrenByParentId = new Map<number | null, FlatPosition[]>();
  const visiblePositions: FlatPosition[] = [];

  for (const position of activeNonAdminPositions) {
    const parentId = position.parentId && visibleIdSet.has(position.parentId)
      ? position.parentId
      : null;
    const siblings = childrenByParentId.get(parentId) ?? [];

    siblings.push(position);
    childrenByParentId.set(parentId, siblings);
  }

  function visit(parentId: number | null, depth: number) {
    const children = childrenByParentId.get(parentId) ?? [];

    for (const child of children) {
      visiblePositions.push({
        ...child,
        depth
      });
      visit(child.id, depth + 1);
    }
  }

  visit(null, 0);

  return visiblePositions;
}

export function isPositionDescendant(targetId: number, parentId: number, positions: FlatPosition[]): boolean {
  const target = positions.find((position) => position.id === targetId);
  if (!target?.parentId) {
    return false;
  }

  if (target.parentId === parentId) {
    return true;
  }

  return isPositionDescendant(target.parentId, parentId, positions);
}

export function getPositionMeta(name: string, index: number): {
  className: string;
  icon: LucideIcon;
  iconClassName: string;
} {
  if (name.includes("대표") || name.includes("소장") || name.includes("공장장")) {
    return {
      className: "border-[#F0C5C5] bg-[#FFF1F1]",
      icon: Crown,
      iconClassName: "fill-[#FFE184] text-[#8E6B22]"
    };
  }

  if (name.includes("연구")) {
    return {
      className: "border-[#F0DD96] bg-[#FFF9D9]",
      icon: FlaskConical,
      iconClassName: "text-[#5E9A70]"
    };
  }

  if (name.includes("스텝") || name.includes("개발")) {
    return {
      className: "border-[#F0DD96] bg-[#FFF9D9]",
      icon: Wrench,
      iconClassName: "text-[#6F6662]"
    };
  }

  if (name.includes("직원")) {
    return {
      className: "border-[#B9D7EF] bg-[#F3FAFF]",
      icon: UserRound,
      iconClassName: "fill-[#7D93A6] text-[#4F6F82]"
    };
  }

  const classes = [
    "border-[#F0C5C5] bg-[#FFF1F1]",
    "border-[#F0DD96] bg-[#FFF9D9]",
    "border-[#B9D7EF] bg-[#F3FAFF]"
  ];

  return {
    className: classes[index % classes.length],
    icon: UserRound,
    iconClassName: "text-[#4F6F82]"
  };
}

export function flattenPositions(positions: PositionTreeNode[], depth = 0): FlatPosition[] {
  return positions.flatMap((position) => [
    {
      ...position,
      depth
    },
    ...flattenPositions(position.children ?? [], depth + 1)
  ]);
}
