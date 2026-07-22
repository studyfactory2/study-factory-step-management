import { BookOpen, Building2 } from "lucide-react";
import type { TaskStatusSummaryByBranch } from "@/api/task";
import { StatusCard } from "@/components/status-card";
import { createStatusCards, defaultBranchSummaries } from "./constants";

export function TaskSummarySection({
  branchSummaries,
}: {
  branchSummaries: TaskStatusSummaryByBranch[];
}) {
  const summaries =
    branchSummaries.length > 0 ? branchSummaries : defaultBranchSummaries;

  return (
    <section className="surface-card p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold tracking-[-0.03em] text-[#191f28]">
            전체 업무 현황
          </h2>
        </div>
        <div className="shrink-0 rounded-full bg-[#edf6ff] px-2 py-1 text-[9px] font-semibold text-[#3182f6]">
          실시간 업데이트
        </div>
      </div>

      <div className="space-y-2">
        {summaries.map((summary, index) => {
          const BranchIcon = getBranchIcon(summary.branch);

          return (
            <div
              className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-1.5 rounded-[14px] bg-[#f7f8fa] p-2"
              key={summary.branch}
            >
              <div
                className={`flex flex-col items-center gap-1 text-center ${index % 2 === 0 ? "text-[#3182f6]" : "text-[#8b5cf6]"}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-white shadow-sm">
                  <BranchIcon aria-hidden className="h-3.5 w-3.5" />
                </span>
                <span className="break-keep text-[10px] font-bold leading-tight text-[#333d4b]">
                  {summary.branch}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {createStatusCards(summary).map((card) => (
                  <StatusCard
                    key={`${summary.branch}-${card.label}`}
                    {...card}
                  />
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
