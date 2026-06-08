import type { LucideIcon } from "lucide-react";
import { Crown, ShieldCheck, UserRound } from "lucide-react";
import type { PositionTreeNode } from "@/api/position";
import { cn } from "@/util/utils";

const toneClassNames = [
  "border-primary bg-[#FFF0F2]",
  "border-[#C8D3A7] bg-[#FAF9EA]",
  "border-[#F0D8A8] bg-[#FFF8E9]",
  "border-[#CDBDEB] bg-[#F6EFFF]",
  "border-[#F5C5CF] bg-[#FFF6F8]"
];

type RoleTreeProps = {
  positions: PositionTreeNode[];
  selectedPositionId: number | null;
  onSelectPosition: (positionId: number) => void;
};

export function RoleTree({ positions, selectedPositionId, onSelectPosition }: RoleTreeProps) {
  const visiblePositions = filterVisiblePositions(positions);
  const levels = createPositionLevels(visiblePositions);

  if (visiblePositions.length === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-[#EBCDD1] bg-[#FFF9FA] px-4 py-8 text-center text-sm font-bold text-[#9C7D79]">
        등록된 직위트리가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {levels.map((level, depth) => (
        <div
          className={cn(
            "gap-3",
            level.length === 1
              ? "flex justify-center"
              : "grid grid-cols-2 lg:grid-cols-4"
          )}
          key={depth}
        >
          {level.map((position, index) => (
            <PositionCard
              className={level.length === 1 ? "w-40 lg:w-48" : undefined}
              index={index + depth}
              isSelected={selectedPositionId === position.id}
              key={position.id}
              onSelect={() => onSelectPosition(position.id)}
              position={position}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function filterVisiblePositions(positions: PositionTreeNode[]): PositionTreeNode[] {
  return positions
    .filter((position) => position.isLoginVisible)
    .map((position) => ({
      ...position,
      children: filterVisiblePositions(position.children ?? [])
    }));
}

function createPositionLevels(positions: PositionTreeNode[]): PositionTreeNode[][] {
  const levels: PositionTreeNode[][] = [];

  function collect(nodes: PositionTreeNode[], depth: number) {
    if (nodes.length === 0) {
      return;
    }

    levels[depth] = [...(levels[depth] ?? []), ...nodes];
    nodes.forEach((node) => collect(node.children ?? [], depth + 1));
  }

  collect(positions, 0);

  return levels;
}

function PositionCard({
  className,
  index,
  isSelected,
  onSelect,
  position
}: {
  className?: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  position: PositionTreeNode;
}) {
  const Icon = getPositionIcon(position);
  const toneClassName = toneClassNames[index % toneClassNames.length];

  return (
    <button
      className={cn(
        "flex min-h-[84px] w-full flex-col items-center justify-center rounded-2xl border px-3 py-3 text-center shadow-sm transition",
        toneClassName,
        isSelected && "ring-2 ring-primary ring-offset-2",
        className
      )}
      onClick={onSelect}
      type="button"
    >
      <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <span className="text-sm font-black">{position.name}</span>
      {position.subtitle && (
        <span className="mt-1 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
          {position.subtitle}
        </span>
      )}
    </button>
  );
}

function getPositionIcon(position: PositionTreeNode): LucideIcon {
  if (position.code === "CEO") {
    return Crown;
  }

  if (position.isAdmin || position.subtitle?.includes("관리") || position.subtitle?.includes("총괄")) {
    return ShieldCheck;
  }

  return UserRound;
}
