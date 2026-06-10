import type { TaskDetail } from "@/api/task";
import { roleLabels } from "@/components/adminDashboard/constants";
import { formatDateTime } from "@/components/adminDashboard/utils";
import { getStatusClassName, getStatusLabel } from "./constants";

export function TaskSummarySection({ task }: { task: TaskDetail }) {
  const assigneePositionName = task.assignee.positionName ?? roleLabels[task.assignee.roleType];

  return (
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-4 py-4 shadow-[0_6px_0_#EFC6BE]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-[15px] font-black leading-5 text-[#3F2C28]">{task.title}</h2>
          <p className="mt-2 text-[11px] font-black text-[#5A3E3B]">
            담당자 {task.assignee.name} · {assigneePositionName}
          </p>
          <div className="mt-2 space-y-1 text-[9px] font-bold text-[#9B7A75]">
            <p>최초생성일&nbsp;&nbsp; {formatDateTime(task.createdAt)}</p>
            <p>최종수정일&nbsp;&nbsp; {formatDateTime(task.updatedAt)}</p>
          </div>
        </div>
        <span
          className={`flex h-7 shrink-0 items-center justify-center rounded-full border border-[#F1CFD5] px-2 text-[8px] font-black ${getStatusClassName(task.status)}`}
        >
          상태: {getStatusLabel(task.status)}
        </span>
      </div>
    </section>
  );
}
