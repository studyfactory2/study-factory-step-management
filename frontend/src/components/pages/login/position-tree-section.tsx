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
    <section className="mb-4 rounded-[22px] border border-[#EBCDD1] bg-white/86 p-3.5 shadow-soft backdrop-blur">
      <div className="mb-3 flex items-center justify-center rounded-full bg-[#FFF1F6] px-4 py-1.5">
        <h2 className="text-center text-[20px] font-black tracking-normal text-[#3F2C28]">
          직위트리
        </h2>
      </div>

      {message ? (
        <div className="rounded-[18px] border border-dashed border-[#EBCDD1] bg-[#FFF9FA] px-4 py-8 text-center text-sm font-bold text-[#9C7D79]">
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
