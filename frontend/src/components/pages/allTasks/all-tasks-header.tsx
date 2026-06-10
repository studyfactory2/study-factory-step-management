import { ArrowLeft, BriefcaseBusiness } from "lucide-react";

type AllTasksHeaderProps = {
  isAdmin: boolean;
  onBack: () => void;
  taskCount: number;
};

export function AllTasksHeader({ isAdmin, onBack, taskCount }: AllTasksHeaderProps) {
  return (
    <header className="rounded-[28px] border border-[#F1CFD5] bg-[#FFFEFC]/95 px-7 py-6 shadow-[0_10px_22px_rgba(239,126,158,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          className="flex h-11 items-center gap-2 rounded-full border-2 border-[#F2C9C2] bg-white px-5 text-sm font-black text-primary"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          돌아가기
        </button>
        <div className="text-center">
          <h1 className="mt-1 text-3xl font-black tracking-normal text-[#3F2C28]">
            {isAdmin ? "전체 업무" : "내 전체 업무"}
          </h1>
        </div>
        <div className="flex h-11 items-center gap-2 rounded-full bg-[#FFF1F6] px-5 text-sm font-black text-[#9B7A75]">
          <BriefcaseBusiness aria-hidden className="h-4 w-4 text-primary" />
          {taskCount}건
        </div>
      </div>
    </header>
  );
}
