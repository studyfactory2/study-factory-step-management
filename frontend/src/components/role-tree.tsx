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

  if (visiblePositions.length === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-[#EBCDD1] bg-[#FFF9FA] px-4 py-8 text-center text-sm font-bold text-[#9C7D79]">
        등록된 조직도가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max justify-center gap-3 px-1">
        {visiblePositions.map((position, index) => (
          <PositionNode
            index={index}
            key={position.id}
            onSelectPosition={onSelectPosition}
            position={position}
            selectedPositionId={selectedPositionId}
          />
        ))}
      </div>
    </div>
  );
}

function filterVisiblePositions(positions: PositionTreeNode[]): PositionTreeNode[] {
  return positions.flatMap((position) => {
    const children = filterVisiblePositions(position.children ?? []);

    if (!position.isLoginVisible) {
      return children;
    }

    return {
      ...position,
      children
    };
  });
}

function PositionNode({
  index,
  onSelectPosition,
  position,
  selectedPositionId
}: {
  index: number;
  onSelectPosition: (positionId: number) => void;
  position: PositionTreeNode;
  selectedPositionId: number | null;
}) {
  const children = position.children ?? [];

  return (
    <div className="relative flex flex-col items-center">
      <PositionCard
        className="w-[92px]"
        index={index}
        onSelect={() => onSelectPosition(position.id)}
        position={position}
      />

      {children.length > 0 && (
        <div className="relative mt-5 w-full min-w-max">
          <span className="absolute left-1/2 top-[-1.25rem] h-[1.32rem] w-0.5 -translate-x-1/2 rounded-full bg-[#E5C5CB]" />
          <span
            className={cn(
              "absolute top-[-1px] h-0.5 rounded-full bg-[#E5C5CB]",
              children.length === 1 && "left-1/2 right-1/2",
              children.length === 2 && "left-1/4 right-1/4",
              children.length === 3 && "left-[16.666%] right-[16.666%]",
              children.length >= 4 && "left-[12.5%] right-[12.5%]"
            )}
          />
          <div
            className={cn(
              "grid justify-items-center gap-2 pt-4",
              children.length === 1 && "grid-cols-1",
              children.length === 2 && "grid-cols-2",
              children.length === 3 && "grid-cols-3",
              children.length >= 4 && "grid-cols-4"
            )}
          >
            {children.map((child, childIndex) => (
              <div className="relative" key={child.id}>
                <span className="absolute left-1/2 top-[-1.05rem] h-[1.1rem] w-0.5 -translate-x-1/2 rounded-full bg-[#E5C5CB]" />
                <PositionNode
                  index={childIndex + index + 1}
                  onSelectPosition={onSelectPosition}
                  position={child}
                  selectedPositionId={selectedPositionId}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PositionCard({
  className,
  index,
  onSelect,
  position
}: {
  className?: string;
  index: number;
  onSelect: () => void;
  position: PositionTreeNode;
}) {
  const Icon = getPositionIcon(position);
  const toneClassName = toneClassNames[index % toneClassNames.length];

  return (
    <button
      className={cn(
        "flex min-h-[64px] w-full flex-col items-center justify-center rounded-[14px] border px-2 py-2 text-center shadow-sm transition",
        toneClassName,
        className
      )}
      onClick={onSelect}
      type="button"
    >
      <span className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary shadow-sm">
        <Icon aria-hidden className="h-3.5 w-3.5" />
      </span>
      <span className="text-[12px] font-black leading-tight">{position.name}</span>
      {position.subtitle && (
        <span className="mt-0.5 max-w-full rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-bold leading-tight text-muted-foreground">
          {position.subtitle}
        </span>
      )}
    </button>
  );
}

function getPositionIcon(position: PositionTreeNode): LucideIcon {
  if (position.name === "대표") {
    return Crown;
  }

  if (position.isAdmin || position.subtitle?.includes("관리") || position.subtitle?.includes("총괄")) {
    return ShieldCheck;
  }

  return UserRound;
}
