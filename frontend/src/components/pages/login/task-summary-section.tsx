import type { TaskStatusSummary } from "@/api/task";
import { StatusCard } from "@/components/status-card";
import { createStatusCards } from "./constants";

export function TaskSummarySection({ taskSummary }: { taskSummary: TaskStatusSummary }) {
  return (
    <section className="mb-5 rounded-[24px] border border-[#EBCDD1] bg-white/86 p-4 shadow-soft backdrop-blur">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[21px] font-black tracking-normal text-[#3F2C28]">전체업무현황</h2>
        <div className="rounded-full bg-[#FFF1C9] px-4 py-2 text-sm font-bold text-[#B18735]">
          우리 모두 잘하고 있어요!
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {createStatusCards(taskSummary).map((card) => (
          <StatusCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  );
}
