import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Clipboard, MessageCircle } from "lucide-react";
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
  showScopeSelector?: boolean;
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
  selectedStatuses = [],
  showScopeSelector = true
}: RecentOutputsSectionProps) {
  const filteredOutputs = filterOutputsByStatus(
    filterOutputsByScope(recentOutputs, selectedScope, currentMemberId),
    selectedStatuses
  );
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const scopeDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!scopeDropdownRef.current?.contains(event.target as Node)) {
        setIsScopeOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleScopeSelect(value: RecentOutputScope) {
    onScopeChange?.(value);
    setIsScopeOpen(false);
  }

  return (
    <section className="rounded-[18px] border border-[#D8D1CE] bg-[#FFFEFC] p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)] sm:p-4">
      <div className="mb-2.5 flex items-center gap-1.5">
        <Clipboard aria-hidden className="h-4.5 w-4.5 text-[#7B716D]" />
        <h2 className="text-[18px] font-normal text-[#222222]">최근 업무 현황</h2>
      </div>

      <div className="mb-2.5 flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-0.5">
          {statusOptions.map((option) => {
            const isSelected = selectedStatuses.includes(option.value);

            return (
              <button
                className={`h-[20px] w-[44px] shrink-0 rounded-[6px] border px-0 text-[9px] font-normal leading-none transition ${
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
        {showScopeSelector ? (
          <div className="relative shrink-0" ref={scopeDropdownRef}>
            <button
              aria-label="최근 업무 범위"
              aria-expanded={isScopeOpen}
              className="flex h-[20px] w-[78px] items-center justify-between rounded-[6px] border border-[#D8D1CE] bg-white pl-1.5 pr-1 text-left text-[10px] font-normal leading-none text-[#333333] outline-none"
              onClick={() => setIsScopeOpen((current) => !current)}
              type="button"
            >
              <span className="truncate">{scopeLabels[selectedScope]}</span>
              <ChevronDown
                aria-hidden
                className={`h-3 w-3 shrink-0 text-[#8E8581] transition ${isScopeOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isScopeOpen && (
              <div className="absolute right-0 top-[24px] z-30 w-[96px] overflow-hidden rounded-[7px] border border-[#D8D1CE] bg-white py-1 shadow-[0_8px_18px_rgba(95,73,68,0.16)]">
                {Object.entries(scopeLabels).map(([value, label]) => {
                  const scopeValue = value as RecentOutputScope;
                  const isSelected = selectedScope === scopeValue;

                  return (
                    <button
                      className={`flex h-7 w-full items-center px-2 text-left text-[10px] font-normal ${
                        isSelected ? "bg-[#EAF3FF] text-[#2D70CB]" : "text-[#4F4542] hover:bg-[#F7F7F7]"
                      }`}
                      key={value}
                      onClick={() => handleScopeSelect(scopeValue)}
                      type="button"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-[50px_minmax(0,1fr)_56px_56px] gap-1 px-2 pb-1 text-center text-[10px] font-normal text-[#7B716D] sm:grid-cols-[72px_minmax(0,1fr)_72px_72px] sm:text-[11px]">
        <span>최초 작성자</span>
        <span>업무 제목</span>
        <span>상태</span>
        <span>받는이</span>
      </div>

      <div className="max-h-[330px] space-y-1.5 overflow-y-auto pr-0.5 sm:max-h-[460px]">
        {filteredOutputs.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-[12px] border border-dashed border-[#D8D1CE] bg-white text-[13px] font-normal text-[#7B716D]">
            표시할 최근 업무가 없습니다.
          </div>
        )}

        {filteredOutputs.map((output) => {
          const direction = getOutputDirection(output);
          const isCompleted = output.taskStatus === "COMPLETED";
          const isCreatorReceiver = direction === "TO_CREATOR";
          const isMemberReceiver = direction === "TO_MEMBER";
          const completedTextClassName = isCompleted ? "line-through decoration-[#8E8581] decoration-1" : "";

          return (
            <button
              className="grid min-h-[56px] w-full grid-cols-[5px_50px_minmax(0,1fr)_56px_56px] items-stretch overflow-hidden rounded-[10px] border border-[#E7E0DD] bg-white text-left shadow-[0_1px_4px_rgba(95,73,68,0.06)] sm:grid-cols-[5px_72px_minmax(0,1fr)_72px_72px]"
              key={output.taskId}
              onClick={() => onDetailOpen(output.taskId)}
              type="button"
            >
              <span className={getStatusBarClassName(output.taskStatus)} />
              <span className="flex min-w-0 flex-col items-start justify-center pl-2.5 pr-1 text-left font-normal leading-none">
                <span className={`line-clamp-1 break-keep text-[11px] ${isCreatorReceiver && !isCompleted ? "text-[#2D70CB]" : "text-[#4F4542]"} ${completedTextClassName}`}>
                  {output.creatorName ?? output.memberName}
                </span>
                <span className={`mt-0.5 line-clamp-1 break-keep text-[9px] text-[#7B716D] ${completedTextClassName}`}>
                  {output.creatorOrganizationName ?? "미지정"}
                </span>
                <span className={`mt-0.5 whitespace-nowrap text-[8px] text-[#9A918D] ${completedTextClassName}`}>
                  {formatCompactDateTime(output.updatedAt ?? output.startedAt)}
                </span>
              </span>
              <span className="flex min-w-0 flex-col justify-center pl-5 pr-1.5 sm:pl-6 sm:pr-3">
                <span className="flex min-w-0 items-center gap-1">
                  <span className={`truncate text-[12px] font-normal leading-3 text-[#222222] ${completedTextClassName}`}>
                    {output.taskTitle}
                  </span>
                  {output.isNew && !isCompleted ? (
                    <span className="shrink-0 rounded-full bg-[#E30613] px-1 py-0.5 text-[8px] font-normal uppercase leading-none text-white">
                      new
                    </span>
                  ) : null}
                </span>
                {output.oneLineComment && (
                  <span className={`mt-1 flex min-w-0 items-center gap-1 text-[9px] font-normal leading-none text-[#9A918D] ${completedTextClassName}`}>
                    <MessageCircle aria-hidden className="h-2.5 w-2.5 shrink-0 text-[#9A918D]" />
                    <span className="truncate">{output.oneLineComment}</span>
                  </span>
                )}
              </span>
              <span className="flex items-center justify-center px-0">
                <span className={`flex h-[18px] w-[50px] items-center justify-center gap-0.5 rounded-full text-[9px] font-normal leading-none sm:w-[58px] sm:text-[10px] ${getStatusBadgeClassName(output.taskStatus)}`}>
                  {!isCompleted && direction === "TO_CREATOR" && <span aria-hidden>←</span>}
                  <span>{getStatusLabel(output.taskStatus)}</span>
                  {!isCompleted && direction === "TO_MEMBER" && <span aria-hidden>→</span>}
                  {isCompleted && <Check aria-hidden className="h-2.5 w-2.5 stroke-[2.5]" />}
                </span>
              </span>
              <span className="flex min-w-0 items-center justify-center px-0 text-center text-[11px] font-normal leading-3">
                <span className={`line-clamp-2 break-keep ${isMemberReceiver && !isCompleted ? "text-[#2D70CB]" : "text-[#4F4542]"} ${completedTextClassName}`}>
                  {output.memberName}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function getOutputDirection(output: AdminDashboardRecentOutput) {
  const lastActorId = output.lastActorId ?? output.creatorId;

  if (lastActorId === output.memberId) {
    return "TO_CREATOR";
  }

  return "TO_MEMBER";
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
