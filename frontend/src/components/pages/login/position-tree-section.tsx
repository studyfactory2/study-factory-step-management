import type { PositionTreeNode } from "@/api/position";
import { RoleTree } from "@/components/role-tree";

type PositionTreeSectionProps = {
  message: string;
  onSelectPosition: (positionId: number) => void;
  positions: PositionTreeNode[];
  selectedPositionId: number | null;
};

export function PositionTreeSection({
  message,
  onSelectPosition,
  positions,
  selectedPositionId
}: PositionTreeSectionProps) {
  return (
    <section className="mb-3 rounded-[18px] border border-[#EBCDD1] bg-white/86 px-1.5 py-2.5 shadow-soft backdrop-blur">
      {message ? (
        <div className="rounded-[16px] border border-dashed border-[#EBCDD1] bg-[#FFF9FA] px-3 py-5 text-center text-xs font-bold text-[#9C7D79]">
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
