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
  selectedPositionId
}: PositionTreeSectionProps) {
  return (
    <section className="mb-3 rounded-[16px] border border-[#D9D2CF] bg-white px-1.5 py-2.5 shadow-[0_2px_10px_rgba(95,73,68,0.08)] sm:px-2.5 sm:py-3">
      {isLoading ? (
        <div className="rounded-[12px] border border-dashed border-[#D9D2CF] bg-[#FFFAFA] px-3 py-5 text-center text-xs font-bold text-[#9C7D79]">
          직위트리를 불러오는 중입니다.
        </div>
      ) : message ? (
        <div className="rounded-[12px] border border-dashed border-[#D9D2CF] bg-[#FFFAFA] px-3 py-5 text-center text-xs font-bold text-[#9C7D79]">
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
