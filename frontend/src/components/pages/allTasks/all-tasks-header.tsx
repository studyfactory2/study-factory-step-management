import { ArrowLeft, BriefcaseBusiness } from "lucide-react";

type AllTasksHeaderProps = {
  isAdmin: boolean;
  onBack: () => void;
  taskCount: number;
};

export function AllTasksHeader({ isAdmin, onBack, taskCount }: AllTasksHeaderProps) {
  return (
    <header className="rounded-[20px] border border-[#F1CFD5] bg-[#FFFEFC]/95 px-3 py-3 shadow-[0_8px_18px_rgba(239,126,158,0.12)]">
      <div className="grid grid-cols-[72px_1fr_54px] items-center gap-2">
        <button
          className="flex h-8 items-center justify-center gap-1 rounded-full border border-[#F2C9C2] bg-white px-2 text-[10px] font-black text-primary"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden className="h-3 w-3" />
          돌아가기
        </button>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-[19px] font-black tracking-normal text-[#3F2C28]">
            {isAdmin ? "전체 업무" : "내 전체 업무"}
          </h1>
        </div>
        <div className="flex h-8 items-center justify-center gap-1 rounded-full bg-[#FFF1F6] px-2 text-[10px] font-black text-[#9B7A75]">
          <BriefcaseBusiness aria-hidden className="h-3 w-3 text-primary" />
          {taskCount}건
        </div>
      </div>
    </header>
  );
}
