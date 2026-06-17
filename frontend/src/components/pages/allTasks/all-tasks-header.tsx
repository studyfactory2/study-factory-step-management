import { ArrowLeft, BriefcaseBusiness } from "lucide-react";

type AllTasksHeaderProps = {
  isAdmin: boolean;
  onBack: () => void;
  taskCount: number;
};

export function AllTasksHeader({ isAdmin, onBack, taskCount }: AllTasksHeaderProps) {
  return (
    <header className="rounded-[20px] border border-[#F1CFD5] bg-[#FFFEFC]/95 px-3 py-3 shadow-[0_8px_18px_rgba(239,126,158,0.12)]">
      <div className="grid grid-cols-[38px_1fr_54px] items-center gap-2 sm:grid-cols-[44px_1fr_64px] md:grid-cols-[50px_1fr_76px]">
        <button
          aria-label="뒤로가기"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#F2C9C2] bg-white text-primary sm:h-9 sm:w-9 md:h-10 md:w-10"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </button>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-[21px] font-black tracking-normal text-[#3F2C28]">
            {isAdmin ? "전체 업무" : "내 전체 업무"}
          </h1>
        </div>
        <div className="flex h-8 items-center justify-center gap-1 rounded-full bg-[#FFF1F6] px-2 text-[12px] font-black text-[#9B7A75]">
          <BriefcaseBusiness aria-hidden className="h-3 w-3 text-primary" />
          {taskCount}건
        </div>
      </div>
    </header>
  );
}
