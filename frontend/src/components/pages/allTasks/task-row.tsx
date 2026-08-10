import type { TaskRecentWorkStatus } from "@/api/task";
import { roleLabels } from "@/components/adminDashboard/constants";
import { formatDateTime } from "@/components/adminDashboard/utils";
import { getStatusClassName, getStatusLabel } from "./constants";

type TaskRowProps = {
  onDetailOpen: () => void;
  task: TaskRecentWorkStatus;
};

export function TaskRow({ onDetailOpen, task }: TaskRowProps) {
  return (
    <article
      className={`relative grid grid-cols-[1fr_74px] items-center gap-x-2 gap-y-2 rounded-[15px] border border-[#e5e8eb] bg-white px-3 pb-3 shadow-[0_3px_10px_rgba(49,91,140,0.07)] transition hover:border-[#b8d5ff] hover:shadow-[0_6px_16px_rgba(49,130,246,0.11)] ${
        task.isNew ? "pt-7" : "pt-3"
      }`}
    >
      {task.isNew && (
        <span className="absolute left-3 top-2 rounded-full bg-[#3182f6] px-2 py-0.5 text-[10px] font-semibold uppercase text-white shadow-sm">
          new
        </span>
      )}
      <div className="min-w-0">
        <p className="line-clamp-2 text-[13px] font-bold leading-4 text-[#333d4b]">
          {task.memberPositionName ?? roleLabels[task.memberRole]} {task.memberName} - {task.taskTitle}
        </p>
        <p className="mt-1 text-[10px] font-medium leading-3 text-[#8b95a1]">
          업무 등록일: {formatDateTime(task.startedAt)}
        </p>
        {task.taskStatus === "REVIEW_REQUESTED" && task.submittedAt && (
          <p className="text-[10px] font-medium leading-3 text-[#8b95a1]">
            제출일: {formatDateTime(task.submittedAt)}
          </p>
        )}
        <p className="mt-1 min-h-3 truncate text-[11px] font-medium text-[#6b7684]">
          {task.oneLineComment || "\u00A0"}
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <span
          className={`flex h-6 items-center justify-center rounded-full border border-transparent text-[10px] font-semibold ${getStatusClassName(task.taskStatus)}`}
        >
          {getStatusLabel(task.taskStatus)}
        </span>
        <button
          className="h-6 rounded-[8px] border border-[#b8d5ff] bg-[#f2f7ff] text-[10px] font-semibold text-[#3182f6] transition hover:border-[#3182f6] hover:bg-[#eaf3ff] active:scale-95"
          onClick={onDetailOpen}
          type="button"
        >
          상세보기
        </button>
      </div>
    </article>
  );
}
