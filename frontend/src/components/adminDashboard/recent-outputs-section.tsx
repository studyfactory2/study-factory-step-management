import type { AdminDashboardRecentOutput, AdminDashboardSortOrder } from "@/api/admin";
import type { TaskStatus } from "@/types/domain";
import { roleLabels } from "./constants";
import { formatDateTime } from "./utils";

type RecentOutputsSectionProps = {
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
  onDetailOpen,
  onSortOrderToggle,
  onStatusToggle,
  recentOutputs,
  selectedSortOrder,
  selectedStatuses
}: RecentOutputsSectionProps) {
  return (
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <div className="space-y-5">
        <h2 className="text-2xl font-semibold text-[#5A3E3B]">최근 작업 근황</h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {taskStatusOptions.map((option) => {
              const isSelected = selectedStatuses.includes(option.value);

              return (
                <button
                  className={`h-11 rounded-full border-2 px-6 text-sm font-black transition ${
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
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              className="h-11 rounded-full border-2 border-[#D9D1F3] bg-[#F7F3FF] px-7 text-sm font-black text-[#8B72C8]"
              onClick={onSortOrderToggle}
              type="button"
            >
              {selectedSortOrder === "LATEST" ? "최신순" : "과거순"}
            </button>
            <button
              className="h-11 rounded-full border-2 border-primary bg-white px-8 text-sm font-semibold text-primary"
              type="button"
            >
              전체 업무보기
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 rounded-[18px] border border-[#F2C9C2] bg-white p-7">
        <div className="max-h-[340px] space-y-4 overflow-y-auto pr-4">
          {recentOutputs.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-[#F2C9C2] bg-[#FFF8F6] text-sm font-semibold text-[#9B7A75]">
              현재 상태의 작업이 없습니다.
            </div>
          )}
          {recentOutputs.map((output) => (
            <article
              className={`relative grid items-center gap-5 rounded-2xl border border-[#F2C9C2] bg-[#FFF8F6] px-6 pb-5 shadow-[0_7px_0_#EFC6BE] lg:grid-cols-[1fr_140px_140px] ${
                output.isNew ? "pt-10" : "pt-5"
              }`}
              key={output.taskId}
            >
              {output.isNew && (
                <span className="absolute left-4 top-3 rounded-full bg-primary px-3 py-1 text-[11px] font-black uppercase text-white shadow-sm">
                  new
                </span>
              )}
              <div>
                <p className="text-xl font-semibold text-[#5A3E3B]">
                  {output.memberPositionName ?? roleLabels[output.memberRole]} {output.memberName} - {output.taskTitle}
                </p>
                <p className="mt-2 text-sm font-medium text-[#9B7A75]">
                  업무 등록일: {formatDateTime(output.startedAt)}
                </p>
                {output.taskStatus === "REVIEW_REQUESTED" && output.submittedAt && (
                  <p className="text-sm font-medium text-[#9B7A75]">
                    제출일: {formatDateTime(output.submittedAt)}
                  </p>
                )}
                <p className="mt-2 min-h-5 text-sm font-bold text-[#8F7470]">
                  {output.oneLineComment || "\u00A0"}
                </p>
              </div>
              <span
                className={`flex h-10 items-center justify-center rounded-full border border-[#F1CFD5] text-sm font-black ${getStatusClassName(output.taskStatus)}`}
              >
                {getStatusLabel(output.taskStatus)}
              </span>
              <button
                className="h-10 rounded-full border-2 border-primary bg-white text-sm font-semibold text-primary"
                onClick={() => onDetailOpen(output.taskId)}
                type="button"
              >
                상세보기
              </button>
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
