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
      className={`relative grid grid-cols-[1fr_74px] items-center gap-x-2 gap-y-2 rounded-[15px] border border-[#F2C9C2] bg-[#FFF8F6] px-3 pb-3 shadow-[0_4px_0_#EFC6BE]  ${
        task.isNew ? "pt-7" : "pt-3"
      }`}
    >
      {task.isNew && (
        <span className="absolute left-3 top-2 rounded-full bg-primary px-2 py-0.5 text-[8px] font-black uppercase text-white shadow-sm">
          new
        </span>
      )}
      <div className="min-w-0">
        <p className="line-clamp-2 text-[11px] font-black leading-4 text-[#5A3E3B]">
          {task.memberPositionName ?? roleLabels[task.memberRole]} {task.memberName} - {task.taskTitle}
        </p>
        <p className="mt-1 text-[8px] font-medium leading-3 text-[#9B7A75]">
          업무 등록일: {formatDateTime(task.startedAt)}
        </p>
        {task.taskStatus === "REVIEW_REQUESTED" && task.submittedAt && (
          <p className="text-[8px] font-medium leading-3 text-[#9B7A75]">
            제출일: {formatDateTime(task.submittedAt)}
          </p>
        )}
        <p className="mt-1 min-h-3 truncate text-[9px] font-bold text-[#8F7470]">
          {task.oneLineComment || "\u00A0"}
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <span
          className={`flex h-6 items-center justify-center rounded-full border border-[#F1CFD5] text-[8px] font-black ${getStatusClassName(task.taskStatus)}`}
        >
          {getStatusLabel(task.taskStatus)}
        </span>
        <button
          className="h-6 rounded-full border border-primary bg-white text-[8px] font-black text-primary"
          onClick={onDetailOpen}
          type="button"
        >
          상세보기
        </button>
      </div>
    </article>
  );
}
