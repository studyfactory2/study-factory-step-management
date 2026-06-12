import { ChevronDown, Clipboard } from "lucide-react";
import type { AdminDashboardRecentOutput, AdminDashboardSortOrder } from "@/api/admin";
import type { TaskStatus } from "@/types/domain";

export type RecentOutputScope = "ALL" | "MINE" | "STAFF";

type RecentOutputsSectionProps = {
  currentMemberId?: number;
  onAllTasksOpen?: () => void;
  onDetailOpen: (taskId: number) => void;
  onSortOrderToggle?: () => void;
  onScopeChange?: (value: RecentOutputScope) => void;
  onStatusToggle?: (value: TaskStatus) => void;
  recentOutputs: AdminDashboardRecentOutput[];
  selectedSortOrder?: AdminDashboardSortOrder;
  selectedScope?: RecentOutputScope;
  selectedStatuses?: TaskStatus[];
};

const scopeLabels: Record<RecentOutputScope, string> = {
  ALL: "전체",
  MINE: "내가 속한 업무",
  STAFF: "직원들 업무"
};

const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "업무 등록", value: "REGISTERED" },
  { label: "진행 중", value: "IN_PROGRESS" },
  { label: "검토요청", value: "REVIEW_REQUESTED" },
  { label: "완료", value: "COMPLETED" }
];

export function RecentOutputsSection({
  currentMemberId,
  onDetailOpen,
  onScopeChange,
  onStatusToggle,
  recentOutputs,
  selectedScope = "ALL",
  selectedStatuses = []
}: RecentOutputsSectionProps) {
  const filteredOutputs = filterOutputsByStatus(
    filterOutputsByScope(recentOutputs, selectedScope, currentMemberId),
    selectedStatuses
  );

  return (
    <section className="rounded-[18px] border border-[#D8D1CE] bg-[#FFFEFC] p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
      <div className="mb-2.5 flex items-center gap-1.5">
        <Clipboard aria-hidden className="h-4.5 w-4.5 text-[#7B716D]" />
        <h2 className="text-[16px] font-normal text-[#222222]">최근 업무 현황</h2>
      </div>

      <div className="mb-2.5 flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-0.5">
          {statusOptions.map((option) => {
            const isSelected = selectedStatuses.includes(option.value);

            return (
              <button
                className={`h-[20px] w-[44px] shrink-0 rounded-[6px] border px-0 text-[7px] font-normal leading-none transition ${
                  isSelected
                    ? getSelectedStatusButtonClassName(option.value)
                    : "border-[#E4DCD9] bg-white text-[#6F6662]"
                }`}
                key={option.value}
                onClick={() => onStatusToggle?.(option.value)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <label className="relative block shrink-0">
          <select
            aria-label="최근 업무 범위"
            className="h-[20px] w-[78px] appearance-none rounded-[6px] border border-[#D8D1CE] bg-white pl-1 pr-4 text-[8px] font-normal leading-none text-[#333333] outline-none"
            onChange={(event) => onScopeChange?.(event.target.value as RecentOutputScope)}
            value={selectedScope}
          >
            {Object.entries(scopeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#8E8581]"
          />
        </label>
      </div>

      <div className="grid grid-cols-[50px_minmax(0,1fr)_56px_56px] gap-1 px-2 pb-1 text-center text-[8px] font-normal text-[#7B716D]">
        <span>최초 작성자</span>
        <span>업무 제목</span>
        <span>상태</span>
        <span>받는이</span>
      </div>

      <div className="max-h-[330px] space-y-1.5 overflow-y-auto pr-0.5">
        {filteredOutputs.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-[12px] border border-dashed border-[#D8D1CE] bg-white text-[11px] font-normal text-[#7B716D]">
            표시할 최근 업무가 없습니다.
          </div>
        )}

        {filteredOutputs.map((output) => (
          <button
            className="grid min-h-[52px] w-full grid-cols-[5px_50px_minmax(0,1fr)_56px_56px] items-stretch overflow-hidden rounded-[10px] border border-[#E7E0DD] bg-white text-left shadow-[0_1px_4px_rgba(95,73,68,0.06)]"
            key={output.taskId}
            onClick={() => onDetailOpen(output.taskId)}
            type="button"
          >
            <span className={getStatusBarClassName(output.taskStatus)} />
            <span className="flex min-w-0 flex-col items-start justify-center pl-2.5 pr-1 text-left font-normal leading-none">
              <span className="line-clamp-1 break-keep text-[9px] text-[#4F4542]">
                {output.creatorName ?? output.memberName}
              </span>
              <span className="mt-0.5 line-clamp-1 break-keep text-[7px] text-[#7B716D]">
                {output.creatorOrganizationName ?? "미지정"}
              </span>
              <span className="mt-0.5 whitespace-nowrap text-[6px] text-[#9A918D]">
                {formatCompactDateTime(output.updatedAt ?? output.startedAt)}
              </span>
            </span>
            <span className="flex min-w-0 items-center pl-5 pr-1.5">
              <span className="line-clamp-2 text-[10px] font-normal leading-3 text-[#222222]">
                {output.taskTitle}
              </span>
            </span>
            <span className="flex items-center justify-center px-0">
              <span className={`flex h-[18px] w-[50px] items-center justify-center rounded-full text-[7px] font-normal leading-none ${getStatusBadgeClassName(output.taskStatus)}`}>
                {getStatusLabel(output.taskStatus)}
              </span>
            </span>
            <span className="flex min-w-0 items-center justify-center px-0 text-center text-[9px] font-normal leading-3 text-[#4F4542]">
              <span className="line-clamp-2 break-keep">{output.memberName}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function filterOutputsByScope(
  outputs: AdminDashboardRecentOutput[],
  scope: RecentOutputScope,
  currentMemberId?: number
) {
  if (!currentMemberId) {
    return outputs;
  }

  if (scope === "MINE") {
    return outputs.filter((output) => output.memberId === currentMemberId || output.creatorId === currentMemberId);
  }

  if (scope === "STAFF") {
    return outputs.filter((output) => output.memberId !== currentMemberId && output.creatorId !== currentMemberId);
  }

  return outputs;
}

function formatCompactDateTime(value: string) {
  const date = new Date(value);
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date);
  const dateText = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit"
  })
    .format(date)
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
  const timeText = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit"
  }).format(date);

  return `${dateText}(${weekday}) ${timeText}`;
}

function filterOutputsByStatus(outputs: AdminDashboardRecentOutput[], selectedStatuses: TaskStatus[]) {
  if (selectedStatuses.length === 0) {
    return outputs;
  }

  return outputs.filter((output) => selectedStatuses.includes(output.taskStatus));
}

function getStatusLabel(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "업무 등록";
  }

  if (status === "IN_PROGRESS") {
    return "진행 중";
  }

  if (status === "REVIEW_REQUESTED") {
    return "검토요청";
  }

  return "완료";
}

function getStatusBarClassName(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "bg-[#E30613]";
  }

  if (status === "IN_PROGRESS") {
    return "bg-[#F0CF63]";
  }

  if (status === "REVIEW_REQUESTED") {
    return "bg-[#2D70CB]";
  }

  return "bg-[#9B9B9B]";
}

function getStatusBadgeClassName(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "bg-[#FFEDEF] text-[#D83A42]";
  }

  if (status === "IN_PROGRESS") {
    return "bg-[#FFF6D8] text-[#9A7416]";
  }

  if (status === "REVIEW_REQUESTED") {
    return "bg-[#EAF3FF] text-[#2D70CB]";
  }

  return "bg-[#F1F1F1] text-[#6B6B6B]";
}

function getSelectedStatusButtonClassName(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "border-[#F2B3BA] bg-[#FFEDEF] text-[#D83A42]";
  }

  if (status === "IN_PROGRESS") {
    return "border-[#F0CF63] bg-[#FFF6D8] text-[#9A7416]";
  }

  if (status === "REVIEW_REQUESTED") {
    return "border-[#8DB8F0] bg-[#EAF3FF] text-[#2D70CB]";
  }

  return "border-[#D0D0D0] bg-[#F1F1F1] text-[#6B6B6B]";
}
