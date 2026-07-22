import type { PositionTreeNode } from "@/api/position";
import { RoleTree } from "@/components/role-tree";

type PositionTreeSectionProps = {
  isLoading: boolean;
  message: string;
  onSelectPosition: (positionId: number) => void;
  positions: PositionTreeNode[];
  selectedPositionId: number | null;
};

export function PositionTreeSection({
  isLoading,
  message,
  onSelectPosition,
  positions,
  selectedPositionId,
}: PositionTreeSectionProps) {
  return (
    <section className="surface-card p-3">
      <div className="mb-2">
        <h2 className="text-base font-bold tracking-[-0.03em] text-[#191f28]">
          함께 일하는 팀
        </h2>
      </div>
      {isLoading ? (
        <div className="rounded-[16px] bg-[#f7f8fa] px-4 py-8 text-center text-sm font-medium text-[#8b95a1]">
          직위트리를 불러오는 중입니다.
        </div>
      ) : message ? (
        <div className="rounded-[16px] bg-[#f7f8fa] px-4 py-8 text-center text-sm font-medium text-[#8b95a1]">
          {message}
        </div>
      ) : (
        <RoleTree
          onSelectPosition={onSelectPosition}
          positions={positions}
          selectedPositionId={selectedPositionId}
        />
      )}
    </section>
  );
}
