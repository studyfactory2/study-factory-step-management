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
  if (positions.length === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-[#EBCDD1] bg-[#FFF9FA] px-4 py-8 text-center text-sm font-bold text-[#9C7D79]">
        등록된 직위트리가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {positions.map((position, index) => (
        <PositionBranch
          key={position.id}
          depth={0}
          index={index}
          onSelectPosition={onSelectPosition}
          position={position}
          selectedPositionId={selectedPositionId}
        />
      ))}
    </div>
  );
}

function PositionBranch({
  depth,
  index,
  onSelectPosition,
  position,
  selectedPositionId
}: {
  depth: number;
  index: number;
  onSelectPosition: (positionId: number) => void;
  position: PositionTreeNode;
  selectedPositionId: number | null;
}) {
  const children = position.children ?? [];

  return (
    <div className={cn("space-y-3", depth > 0 && "rounded-[18px] bg-white/40 p-3")}>
      <PositionCard
        index={index}
        isSelected={selectedPositionId === position.id}
        onSelect={() => onSelectPosition(position.id)}
        position={position}
      />

      {children.length > 0 && (
        <div
          className={cn(
            "grid gap-3",
            depth === 0 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"
          )}
        >
          {children.map((child, childIndex) => (
            <PositionBranch
              key={child.id}
              depth={depth + 1}
              index={childIndex + index + 1}
              onSelectPosition={onSelectPosition}
              position={child}
              selectedPositionId={selectedPositionId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PositionCard({
  index,
  isSelected,
  onSelect,
  position
}: {
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
        isSelected && "ring-2 ring-primary ring-offset-2"
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
