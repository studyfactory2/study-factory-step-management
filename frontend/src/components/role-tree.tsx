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
        등록된 직위트리가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-auto pb-1">
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
        className="w-[132px] sm:w-36 lg:w-40"
        index={index}
        isSelected={selectedPositionId === position.id}
        onSelect={() => onSelectPosition(position.id)}
        position={position}
      />

      {children.length > 0 && (
        <div className="relative mt-8 w-full min-w-max">
          <span className="absolute left-1/2 top-[-2rem] h-8 w-px -translate-x-1/2 bg-[#E5C5CB]" />
          <span
            className={cn(
              "absolute top-0 h-px bg-[#E5C5CB]",
              children.length === 1 && "left-1/2 right-1/2",
              children.length === 2 && "left-1/4 right-1/4",
              children.length === 3 && "left-[16.666%] right-[16.666%]",
              children.length >= 4 && "left-[12.5%] right-[12.5%]"
            )}
          />
          <div
            className={cn(
              "grid justify-items-center gap-3 pt-5",
              children.length === 1 && "grid-cols-1",
              children.length === 2 && "grid-cols-2",
              children.length === 3 && "grid-cols-3",
              children.length >= 4 && "grid-cols-4"
            )}
          >
            {children.map((child, childIndex) => (
              <div className="relative" key={child.id}>
                <span className="absolute left-1/2 top-[-1.25rem] h-5 w-px -translate-x-1/2 bg-[#E5C5CB]" />
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
        "flex min-h-[78px] w-full flex-col items-center justify-center rounded-2xl border px-2.5 py-2.5 text-center shadow-sm transition",
        toneClassName,
        isSelected && "ring-2 ring-primary ring-offset-2",
        className
      )}
      onClick={onSelect}
      type="button"
    >
      <span className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-sm">
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <span className="text-[13px] font-black">{position.name}</span>
      {position.subtitle && (
        <span className="mt-1 max-w-full rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold leading-tight text-muted-foreground">
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
