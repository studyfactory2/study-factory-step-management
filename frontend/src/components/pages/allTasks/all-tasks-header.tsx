import { ArrowLeft, BriefcaseBusiness } from "lucide-react";

type AllTasksHeaderProps = {
  isAdmin: boolean;
  onBack: () => void;
  taskCount: number;
};

export function AllTasksHeader({ isAdmin, onBack, taskCount }: AllTasksHeaderProps) {
  return (
    <header className="rounded-[20px] border border-[#dce5f2] bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(238,246,255,0.96)_58%,rgba(245,241,255,0.96)_100%)] px-3 py-3 shadow-[0_8px_24px_rgba(49,91,140,0.09)]">
      <div className="grid grid-cols-[38px_1fr_54px] items-center gap-2 sm:grid-cols-[44px_1fr_64px] md:grid-cols-[50px_1fr_76px]">
        <button
          aria-label="뒤로가기"
          className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-[#f2f4f6] text-[#4e5968] transition hover:bg-[#e5e8eb] active:scale-95 sm:h-9 sm:w-9 md:h-10 md:w-10"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </button>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-[21px] font-extrabold tracking-[-0.03em] text-[#191f28]">
            {isAdmin ? "전체 업무" : "내 전체 업무"}
          </h1>
        </div>
        <div className="flex h-8 items-center justify-center gap-1 rounded-full bg-[#eef6ff] px-2 text-[12px] font-semibold text-[#3182f6]">
          <BriefcaseBusiness aria-hidden className="h-3 w-3" />
          {taskCount}건
        </div>
      </div>
    </header>
  );
}
