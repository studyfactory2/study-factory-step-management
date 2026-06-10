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
    <section className="mb-5 rounded-[24px] border border-[#EBCDD1] bg-white/86 p-4 shadow-soft backdrop-blur">
      <div className="mb-4 flex items-center justify-center rounded-full bg-[#FFF1F6] px-4 py-2">
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
