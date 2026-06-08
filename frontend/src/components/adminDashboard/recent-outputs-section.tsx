import type { AdminDashboardRecentOutput, AdminDashboardSortOrder } from "@/api/admin";
import type { TaskStatus } from "@/types/domain";
import { roleLabels } from "./constants";
import { formatDate } from "./utils";

type RecentOutputsSectionProps = {
  onSortOrderChange: (value: AdminDashboardSortOrder | "") => void;
  onStatusChange: (value: TaskStatus) => void;
  recentOutputs: AdminDashboardRecentOutput[];
  selectedSortOrder: AdminDashboardSortOrder | "";
  selectedStatus: TaskStatus;
};

const taskStatusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "등록 업무", value: "REGISTERED" },
  { label: "진행 중", value: "IN_PROGRESS" },
  { label: "검토 요청", value: "REVIEW_REQUESTED" },
  { label: "완료", value: "COMPLETED" }
];

export function RecentOutputsSection({
  onSortOrderChange,
  onStatusChange,
  recentOutputs,
  selectedSortOrder,
  selectedStatus
}: RecentOutputsSectionProps) {
  return (
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <div className="flex items-center justify-between gap-5">
        <div className="flex items-baseline gap-4">
          <h2 className="text-2xl font-semibold text-[#5A3E3B]">최근 작업 근황</h2>
          <p className="text-sm font-medium text-[#9B7A75]">
            직원들의 업무들을 확인하고 피드백 해주세요
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="relative">
            <select
              className="h-11 w-44 appearance-none rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] pl-4 pr-10 text-sm font-medium text-[#B79A94] outline-none"
              onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
              value={selectedStatus}
            >
              {taskStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#9B7A75]">
              ∨
            </span>
          </div>
          <div className="relative">
            <select
              className="h-11 w-44 appearance-none rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] pl-4 pr-10 text-sm font-medium text-[#B79A94] outline-none"
              onChange={(event) => onSortOrderChange(event.target.value as AdminDashboardSortOrder | "")}
              value={selectedSortOrder}
            >
              <option value="">정렬 순</option>
              <option value="LATEST">최신순</option>
              <option value="OLDEST">과거순</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#9B7A75]">
              ∨
            </span>
          </div>
          <button className="h-11 rounded-full border-2 border-primary bg-white px-8 text-sm font-semibold text-primary">
            전체 업무보기
          </button>
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
              className="grid items-center gap-5 rounded-2xl border border-[#F2C9C2] bg-[#FFF8F6] px-6 py-5 shadow-[0_7px_0_#EFC6BE] lg:grid-cols-[140px_1fr_150px_150px_140px]"
              key={output.taskId}
            >
              <div>
                <p className="text-sm font-bold text-primary">
                  {output.memberPositionName ?? roleLabels[output.memberRole]}
                </p>
                <p className="mt-2 text-sm font-medium text-[#9B7A75]">{output.memberName}</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-[#5A3E3B]">{output.taskTitle}</p>
                <p className="mt-2 text-sm font-medium text-[#9B7A75]">
                  업무 등록일: {formatDate(output.startedAt)}
                </p>
                {output.taskStatus === "REVIEW_REQUESTED" && output.submittedAt && (
                  <p className="text-sm font-medium text-[#9B7A75]">
                    제출일: {formatDate(output.submittedAt)}
                  </p>
                )}
              </div>
              <button className="h-9 rounded-full border-2 border-primary bg-white text-sm font-semibold text-primary">
                첨부사진
              </button>
              <button className="h-9 rounded-full border-2 border-primary bg-white text-sm font-semibold text-primary">
                글 미리보기
              </button>
              <div className="space-y-2">
                <button className="h-9 w-full rounded-full bg-primary text-sm font-bold text-white">
                  검토하기
                </button>
                <button className="h-8 w-full rounded-full border-2 border-primary bg-white text-sm font-semibold text-primary">
                  검토 요청
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
