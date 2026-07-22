import type { LucideIcon } from "lucide-react";
import { Crown, ShieldCheck, UserRound } from "lucide-react";
import type { PositionTreeNode } from "@/api/position";
import { cn } from "@/util/utils";

const toneClassNames = [
  "border-[#d6e8ff] bg-[#edf6ff]",
  "border-[#e4dcff] bg-[#f4f0ff]",
  "border-[#d5f1e8] bg-[#ecfbf6]",
  "border-[#dce3ea] bg-[#f7f8fa]",
  "border-[#d6e8ff] bg-[#edf6ff]",
];

type RoleTreeProps = {
  positions: PositionTreeNode[];
  selectedPositionId: number | null;
  onSelectPosition: (positionId: number) => void;
};

export function RoleTree({
  positions,
  selectedPositionId,
  onSelectPosition,
}: RoleTreeProps) {
  const visiblePositions = filterVisiblePositions(positions);

  if (visiblePositions.length === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-[#EBCDD1] bg-[#FFF9FA] px-4 py-8 text-center text-sm font-bold text-[#9C7D79]">
        등록된 조직도가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max justify-center gap-1.5">
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

function filterVisiblePositions(
  positions: PositionTreeNode[],
): PositionTreeNode[] {
  return positions.flatMap((position) => {
    const children = filterVisiblePositions(position.children ?? []);

    if (!position.isLoginVisible) {
      return children;
    }

    return {
      ...position,
      children,
    };
  });
}

function PositionNode({
  index,
  onSelectPosition,
  position,
  selectedPositionId,
}: {
  index: number;
  onSelectPosition: (positionId: number) => void;
  position: PositionTreeNode;
  selectedPositionId: number | null;
}) {
  const children = position.children ?? [];
  const hasDepartmentLabels = children.some((child) => child.organizationName);

  return (
    <div className="relative flex flex-col items-center">
      <PositionCard
        className="w-[70px]"
        index={index}
        onSelect={() => onSelectPosition(position.id)}
        position={position}
      />

      {children.length > 0 && (
        <div className="relative mt-2 w-full min-w-max">
          <span className="absolute left-1/2 top-[-0.5rem] h-[0.55rem] w-0.5 -translate-x-1/2 rounded-full bg-[#d1d6db]" />
          <span
            className={cn(
              "absolute top-[-1px] h-0.5 rounded-full bg-[#d1d6db]",
              children.length === 1 && "left-1/2 right-1/2",
              children.length === 2 && "left-1/4 right-1/4",
              children.length === 3 && "left-[16.666%] right-[16.666%]",
              children.length >= 4 && "left-[12.5%] right-[12.5%]",
            )}
          />
          <div
            className={cn(
              "grid justify-items-center gap-1",
              hasDepartmentLabels ? "pt-4" : "pt-2",
              children.length === 1 && "grid-cols-1",
              children.length === 2 && "grid-cols-2",
              children.length === 3 && "grid-cols-3",
              children.length >= 4 && "grid-cols-4",
            )}
          >
            {children.map((child, childIndex) => (
              <div className="relative" key={child.id}>
                <span
                  className={cn(
                    "absolute left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-[#d1d6db]",
                    hasDepartmentLabels
                      ? "top-[-1rem] h-[1.05rem]"
                      : "top-[-0.5rem] h-[0.55rem]",
                  )}
                />
                {child.organizationName ? (
                  <span className="absolute left-1/2 top-[-1.3rem] z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#edf6ff] px-2 py-0.5 text-[9px] font-semibold leading-none text-[#3182f6]">
                    {child.organizationName}
                  </span>
                ) : null}
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
  position,
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
        "flex min-h-[42px] w-full flex-col items-center justify-center rounded-[12px] border px-1.5 py-1 text-center transition hover:-translate-y-0.5 sm:min-h-[48px] md:min-h-[52px]",
        toneClassName,
        className,
      )}
      onClick={onSelect}
      type="button"
    >
      <span className="mb-0.5 flex h-5 w-5 items-center justify-center rounded-[7px] bg-white text-primary shadow-sm">
        <Icon
          aria-hidden
          className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5"
        />
      </span>
      <span className="text-[11px] font-bold leading-tight text-[#333d4b] sm:text-[12px] md:text-[13px]">
        {position.name}
      </span>
      {position.subtitle && (
        <span className="mt-0.5 max-w-full rounded-full bg-white/80 px-1.5 py-0.5 text-[8px] font-medium leading-tight text-[#8b95a1] sm:text-[9px] md:text-[10px]">
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

  if (
    position.isAdmin ||
    position.subtitle?.includes("관리") ||
    position.subtitle?.includes("총괄")
  ) {
    return ShieldCheck;
  }

  return UserRound;
}
