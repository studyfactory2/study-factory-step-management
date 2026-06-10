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
      className={`relative grid items-center gap-5 rounded-2xl border border-[#F2C9C2] bg-[#FFF8F6] px-6 pb-5 shadow-[0_7px_0_#EFC6BE]  ${
        task.isNew ? "pt-10" : "pt-5"
      }`}
    >
      {task.isNew && (
        <span className="absolute left-4 top-3 rounded-full bg-primary px-3 py-1 text-[11px] font-black uppercase text-white shadow-sm">
          new
        </span>
      )}
      <div>
        <p className="text-xl font-semibold text-[#5A3E3B]">
          {task.memberPositionName ?? roleLabels[task.memberRole]} {task.memberName} - {task.taskTitle}
        </p>
        <p className="mt-2 text-sm font-medium text-[#9B7A75]">
          업무 등록일: {formatDateTime(task.startedAt)}
        </p>
        {task.taskStatus === "REVIEW_REQUESTED" && task.submittedAt && (
          <p className="text-sm font-medium text-[#9B7A75]">
            제출일: {formatDateTime(task.submittedAt)}
          </p>
        )}
        <p className="mt-2 min-h-5 text-sm font-bold text-[#8F7470]">
          {task.oneLineComment || "\u00A0"}
        </p>
      </div>
      <span
        className={`flex h-10 items-center justify-center rounded-full border border-[#F1CFD5] text-sm font-black ${getStatusClassName(task.taskStatus)}`}
      >
        {getStatusLabel(task.taskStatus)}
      </span>
      <button
        className="h-10 rounded-full border-2 border-primary bg-white text-sm font-semibold text-primary"
        onClick={onDetailOpen}
        type="button"
      >
        상세보기
      </button>
    </article>
  );
}
