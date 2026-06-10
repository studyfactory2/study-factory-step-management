import type { AdminDashboardRecentOutput, AdminDashboardSortOrder } from "@/api/admin";
import type { TaskStatus } from "@/types/domain";
import { roleLabels } from "./constants";
import { formatDateTime } from "./utils";

type RecentOutputsSectionProps = {
  onAllTasksOpen: () => void;
  onDetailOpen: (taskId: number) => void;
  onSortOrderToggle: () => void;
  onStatusToggle: (value: TaskStatus) => void;
  recentOutputs: AdminDashboardRecentOutput[];
  selectedSortOrder: AdminDashboardSortOrder;
  selectedStatuses: TaskStatus[];
};

const taskStatusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "등록 업무", value: "REGISTERED" },
  { label: "진행 중", value: "IN_PROGRESS" },
  { label: "검토 요청", value: "REVIEW_REQUESTED" },
  { label: "완료", value: "COMPLETED" }
];

export function RecentOutputsSection({
  onAllTasksOpen,
  onDetailOpen,
  onSortOrderToggle,
  onStatusToggle,
  recentOutputs,
  selectedSortOrder,
  selectedStatuses
}: RecentOutputsSectionProps) {
  return (
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-3.5 py-4 shadow-[0_6px_0_#EFC6BE]">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[15px] font-black text-[#5A3E3B]">최근 작업 근황</h2>
          <button
            className="h-7 shrink-0 rounded-full border-2 border-primary bg-white px-2.5 text-[9px] font-black text-primary"
            onClick={onAllTasksOpen}
            type="button"
          >
            전체 업무보기
          </button>
        </div>
        <div className="grid grid-cols-[1fr_58px] items-center gap-1.5">
          <div className="grid grid-cols-4 gap-1">
            {taskStatusOptions.map((option) => {
              const isSelected = selectedStatuses.includes(option.value);

              return (
                <button
                  className={`h-7 rounded-full border-2 px-0.5 text-[8px] font-black transition ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-[#F2C9C2] bg-[#FFF8F6] text-[#9B7A75]"
                  }`}
                  key={option.value}
                  onClick={() => onStatusToggle(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <button
            className="h-7 rounded-full border-2 border-[#D9D1F3] bg-[#F7F3FF] px-1 text-[8px] font-black text-[#8B72C8]"
            onClick={onSortOrderToggle}
            type="button"
          >
            {selectedSortOrder === "LATEST" ? "최신순" : "과거순"}
          </button>
        </div>
      </div>
      <div className="mt-3 rounded-[18px] border border-[#F2C9C2] bg-white p-2.5">
        <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1.5">
          {recentOutputs.length === 0 && (
            <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-[#F2C9C2] bg-[#FFF8F6] text-[11px] font-semibold text-[#9B7A75]">
              현재 상태의 작업이 없습니다.
            </div>
          )}
          {recentOutputs.map((output) => (
            <article
              className={`relative grid grid-cols-[1fr_108px] items-center gap-2 rounded-2xl border border-[#F2C9C2] bg-[#FFF8F6] px-3 pb-2.5 shadow-[0_3px_0_#EFC6BE] ${
                output.isNew ? "pt-7" : "pt-2.5"
              }`}
              key={output.taskId}
            >
              {output.isNew && (
                <span className="absolute left-3 top-2 rounded-full bg-primary px-2 py-0.5 text-[8px] font-black uppercase text-white shadow-sm">
                  new
                </span>
              )}
              <div>
                <p className="line-clamp-2 text-[10px] font-black leading-3 text-[#5A3E3B]">
                  {output.memberPositionName ?? roleLabels[output.memberRole]} {output.memberName} - {output.taskTitle}
                </p>
                <p className="mt-0.5 text-[7px] font-bold leading-3 text-[#9B7A75]">
                  업무 등록일: {formatDateTime(output.startedAt)}
                </p>
                {output.taskStatus === "REVIEW_REQUESTED" && output.submittedAt && (
                  <p className="text-[7px] font-bold leading-3 text-[#9B7A75]">
                    제출일: {formatDateTime(output.submittedAt)}
                  </p>
                )}
                <p className="mt-0.5 min-h-3 line-clamp-1 text-[8px] font-bold leading-3 text-[#8F7470]">
                  {output.oneLineComment || "\u00A0"}
                </p>
              </div>
              <div className="flex items-center justify-end gap-1">
                <span
                  className={`flex h-6 min-w-0 flex-1 items-center justify-center rounded-full border border-[#F1CFD5] text-[8px] font-black ${getStatusClassName(output.taskStatus)}`}
                >
                  {getStatusLabel(output.taskStatus)}
                </span>
                <button
                  className="h-6 min-w-0 flex-1 rounded-full border-2 border-primary bg-white text-[8px] font-black text-primary"
                  onClick={() => onDetailOpen(output.taskId)}
                  type="button"
                >
                  상세보기
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function getStatusLabel(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "업무 등록";
  }

  if (status === "IN_PROGRESS") {
    return "진행";
  }

  if (status === "REVIEW_REQUESTED") {
    return "검토 요청";
  }

  return "완료";
}

function getStatusClassName(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "bg-[#FBE6EA] text-primary";
  }

  if (status === "IN_PROGRESS") {
    return "bg-[#EEE8FF] text-[#8B72C8]";
  }

  if (status === "REVIEW_REQUESTED") {
    return "bg-[#FFF1D7] text-[#C88449]";
  }

  return "bg-[#E8F3DF] text-[#6D956A]";
}
