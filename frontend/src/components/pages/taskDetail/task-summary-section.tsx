import type { TaskDetail } from "@/api/task";
import { roleLabels } from "@/components/adminDashboard/constants";
import { formatDateTime } from "@/components/adminDashboard/utils";
import { getStatusClassName, getStatusLabel } from "./constants";

export function TaskSummarySection({ task }: { task: TaskDetail }) {
  const assigneePositionName = task.assignee.positionName ?? roleLabels[task.assignee.roleType];

  return (
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2 className="text-2xl font-black text-[#3F2C28]">{task.title}</h2>
          <p className="mt-4 text-base font-black text-[#5A3E3B]">
            담당자 {task.assignee.name} · {assigneePositionName}
          </p>
          <div className="mt-5 space-y-2 text-sm font-bold text-[#9B7A75]">
            <p>최초생성일&nbsp;&nbsp; {formatDateTime(task.createdAt)}</p>
            <p>최종수정일&nbsp;&nbsp; {formatDateTime(task.updatedAt)}</p>
          </div>
        </div>
        <span
          className={`flex h-12 min-w-[190px] items-center justify-center rounded-full border border-[#F1CFD5] px-8 text-sm font-black ${getStatusClassName(task.status)}`}
        >
          상태: {getStatusLabel(task.status)}
        </span>
      </div>
    </section>
  );
}
