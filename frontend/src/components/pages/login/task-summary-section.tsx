import type { TaskStatusSummary } from "@/api/task";
import { StatusCard } from "@/components/status-card";
import { createStatusCards } from "./constants";

export function TaskSummarySection({ taskSummary }: { taskSummary: TaskStatusSummary }) {
  return (
    <section className="mb-3 rounded-[18px] border border-[#EBCDD1] bg-white/86 p-2.5 shadow-soft backdrop-blur">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-[16px] font-black tracking-normal text-[#3F2C28]">전체업무현황</h2>
        <div className="shrink-0 rounded-full bg-[#FFF1C9] px-2.5 py-1 text-[9px] font-bold text-[#B18735]">
          우리 모두 잘하고 있어요!
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {createStatusCards(taskSummary).map((card) => (
          <StatusCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  );
}
