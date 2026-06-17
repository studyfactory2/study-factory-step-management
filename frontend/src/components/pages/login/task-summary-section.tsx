import { BookOpen, Building2, ClipboardList } from "lucide-react";
import type { TaskStatusSummaryByBranch } from "@/api/task";
import { StatusCard } from "@/components/status-card";
import { createStatusCards, defaultBranchSummaries } from "./constants";

export function TaskSummarySection({
  branchSummaries
}: {
  branchSummaries: TaskStatusSummaryByBranch[];
}) {
  const summaries = branchSummaries.length > 0 ? branchSummaries : defaultBranchSummaries;

  return (
    <section className="mb-3 rounded-[16px] border border-[#D9D2CF] bg-white p-2.5 shadow-[0_2px_10px_rgba(95,73,68,0.08)] lg:p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-[15px] font-black tracking-normal text-[#3F2C28]">
          <ClipboardList aria-hidden className="h-4.5 w-4.5 text-[#7B716D]" />
          전체업무현황
        </h2>
        <div className="shrink-0 rounded-full bg-[#FFF1E8] px-2.5 py-1 text-[9px] font-bold text-[#B97A67]">
          우리 모두 잘하고 있어요!
        </div>
      </div>

      <div className="space-y-2 xl:grid xl:grid-cols-2 xl:gap-2 xl:space-y-0">
        {summaries.map((summary, index) => {
          const BranchIcon = getBranchIcon(summary.branch);

          return (
          <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-1.5 xl:grid-cols-[76px_minmax(0,1fr)]" key={summary.branch}>
            <div
              className={`flex min-h-[46px] flex-col items-center justify-center rounded-[9px] border px-1.5 text-center ${
                index % 2 === 0
                  ? "border-[#C8D9F1] bg-[#EAF3FF] text-[#2D70CB]"
                  : "border-[#F2D2CD] bg-[#FFF0ED] text-[#D83A42]"
              }`}
            >
              <span className="mb-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/80">
                <BranchIcon aria-hidden className="h-3.5 w-3.5" />
              </span>
              <span className="break-keep text-[9px] font-black leading-tight">{summary.branch}</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {createStatusCards(summary).map((card) => (
                <StatusCard key={`${summary.branch}-${card.label}`} {...card} />
              ))}
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}

function getBranchIcon(branch: string) {
  if (branch.includes("수험생연구소")) {
    return Building2;
  }

  return BookOpen;
}
