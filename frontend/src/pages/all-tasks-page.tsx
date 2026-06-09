"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, Sparkles } from "lucide-react";
import {
  getTaskAllWorkStatus,
  type TaskRecentWorkStatus
} from "@/api/task";
import type { TaskStatus } from "@/types/domain";
import type { StoredMember } from "@/lib/auth-storage";
import { isAdminRole } from "@/lib/auth-storage";
import { roleLabels } from "@/components/adminDashboard/constants";
import { formatDateTime } from "@/components/adminDashboard/utils";

type AllTasksPageProps = {
  accessToken: string;
  currentMember: StoredMember;
  onBack: () => void;
  onTaskDetailOpen: (taskId: number) => void;
};

type SortOrder = "LATEST" | "OLDEST";

const taskStatusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "등록 업무", value: "REGISTERED" },
  { label: "진행 중", value: "IN_PROGRESS" },
  { label: "검토 요청", value: "REVIEW_REQUESTED" },
  { label: "완료", value: "COMPLETED" }
];

export function AllTasksPage({
  accessToken,
  currentMember,
  onBack,
  onTaskDetailOpen
}: Partial<AllTasksPageProps>) {
  const [tasks, setTasks] = useState<TaskRecentWorkStatus[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([
    "REGISTERED",
    "IN_PROGRESS",
    "REVIEW_REQUESTED",
    "COMPLETED"
  ]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("LATEST");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = currentMember ? isAdminRole(currentMember.roleType) : false;

  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true);

      try {
        if (!accessToken) {
          return;
        }

        const response = await getTaskAllWorkStatus(accessToken, {
          sortOrder,
          statuses: selectedStatuses
        });
        setTasks(response);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "전체 업무를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadTasks();
  }, [accessToken, selectedStatuses, sortOrder]);

  function handleStatusToggle(status: TaskStatus) {
    setSelectedStatuses((currentStatuses) => {
      if (currentStatuses.includes(status)) {
        if (currentStatuses.length === 1) {
          return currentStatuses;
        }

        return currentStatuses.filter((currentStatus) => currentStatus !== status);
      }

      return [...currentStatuses, status];
    });
  }

  if (!accessToken || !currentMember || !onBack || !onTaskDetailOpen) {
    return null;
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-background px-4 py-8 text-foreground sm:px-8">
      <div className="pointer-events-none fixed left-10 top-20 text-[#F0C957]">
        <Sparkles aria-hidden className="h-9 w-9 fill-current" />
      </div>
      <div className="pointer-events-none fixed right-12 top-28 text-[#F1A9C0]">
        <Sparkles aria-hidden className="h-8 w-8 fill-current" />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] space-y-7">
        <header className="rounded-[28px] border border-[#F1CFD5] bg-[#FFFEFC]/95 px-7 py-6 shadow-[0_10px_22px_rgba(239,126,158,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              className="flex h-11 items-center gap-2 rounded-full border-2 border-[#F2C9C2] bg-white px-5 text-sm font-black text-primary"
              onClick={onBack}
              type="button"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              돌아가기
            </button>
            <div className="text-center">
              <h1 className="mt-1 text-3xl font-black tracking-normal text-[#3F2C28]">
                {isAdmin ? "전체 업무" : "내 전체 업무"}
              </h1>
            </div>
            <div className="flex h-11 items-center gap-2 rounded-full bg-[#FFF1F6] px-5 text-sm font-black text-[#9B7A75]">
              <BriefcaseBusiness aria-hidden className="h-4 w-4 text-primary" />
              {tasks.length}건
            </div>
          </div>
        </header>

        <section className="rounded-[24px] border border-[#F2C9C2] bg-[#FFFEFC] px-6 py-6 shadow-[0_8px_0_#EFC6BE]">
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
                    onClick={() => handleStatusToggle(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <button
              className="h-11 rounded-full border-2 border-[#D9D1F3] bg-[#F7F3FF] px-7 text-sm font-black text-[#8B72C8]"
              onClick={() => setSortOrder((current) => (current === "LATEST" ? "OLDEST" : "LATEST"))}
              type="button"
            >
              {sortOrder === "LATEST" ? "최신순" : "과거순"}
            </button>
          </div>

          {message && (
            <div className="mt-5 rounded-[16px] border border-[#F2C9C2] bg-[#FFF8F9] px-4 py-3 text-sm font-black text-primary">
              {message}
            </div>
          )}

          <div className="mt-6 rounded-[18px] border border-[#F2C9C2] bg-white p-5">
            <div className="max-h-[calc(100dvh-310px)] min-h-[360px] space-y-4 overflow-y-auto pr-3">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-[#F2C9C2] bg-[#FFF8F6] text-sm font-semibold text-[#9B7A75]">
                  업무를 불러오는 중입니다.
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-[#F2C9C2] bg-[#FFF8F6] text-sm font-semibold text-[#9B7A75]">
                  표시할 업무가 없습니다.
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskRow
                    key={task.taskId}
                    onDetailOpen={() => onTaskDetailOpen(task.taskId)}
                    task={task}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TaskRow({
  onDetailOpen,
  task
}: {
  onDetailOpen: () => void;
  task: TaskRecentWorkStatus;
}) {
  return (
    <article
      className={`relative grid items-center gap-5 rounded-2xl border border-[#F2C9C2] bg-[#FFF8F6] px-6 pb-5 shadow-[0_7px_0_#EFC6BE] lg:grid-cols-[1fr_140px_140px] ${
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

export default AllTasksPage;
