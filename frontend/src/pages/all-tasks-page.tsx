"use client";

import { useEffect, useState } from "react";
import {
  getTaskAllWorkStatus,
  type TaskRecentWorkStatus
} from "@/api/task";
import type { TaskStatus } from "@/types/domain";
import type { StoredMember } from "@/lib/auth-storage";
import { isAdminRole } from "@/lib/auth-storage";
import { AllTasksFilterBar } from "@/components/pages/allTasks/all-tasks-filter-bar";
import { AllTasksHeader } from "@/components/pages/allTasks/all-tasks-header";
import { TaskRow } from "@/components/pages/allTasks/task-row";
import type { SortOrder } from "@/components/pages/allTasks/constants";
import { ResponsiveContainer } from "@/components/layout/responsive-container";

type AllTasksPageProps = {
  accessToken: string;
  currentMember: StoredMember;
  onBack: () => void;
  onTaskDetailOpen: (taskId: number) => void;
};

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
    <main className="login-pdf-font relative isolate min-h-dvh overflow-hidden bg-[linear-gradient(180deg,#eaf4ff_0%,#f4f1ff_38%,#f7f8fa_72%)] px-4 py-6 text-[#191f28] sm:px-6 sm:py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(49,130,246,0.28)_0%,rgba(49,130,246,0)_70%)] blur-md"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(124,92,255,0.22)_0%,rgba(124,92,255,0)_70%)] blur-lg"
      />

      <ResponsiveContainer className="relative z-10 space-y-4" variant="detail">
        <AllTasksHeader isAdmin={isAdmin} onBack={onBack} taskCount={tasks.length} />

        <section className="rounded-[20px] border border-[#dce5f2] bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(248,251,255,0.98)_62%,rgba(250,248,255,0.98)_100%)] px-3 py-3 shadow-[0_10px_28px_rgba(49,91,140,0.10)] sm:p-4">
          <AllTasksFilterBar
            onSortToggle={() => setSortOrder((current) => (current === "LATEST" ? "OLDEST" : "LATEST"))}
            onStatusToggle={handleStatusToggle}
            selectedStatuses={selectedStatuses}
            sortOrder={sortOrder}
          />

          {message && (
            <div className="mt-3 rounded-[14px] border border-[#ffd4d8] bg-[#fff4f5] px-3 py-2 text-[13px] font-semibold text-[#e5484d]">
              {message}
            </div>
          )}

          <div className="mt-3 rounded-[16px] border border-[#e5e8eb] bg-white/90 p-2">
            <div className="max-h-[calc(100dvh-220px)] min-h-[330px] space-y-2.5 overflow-y-auto pr-1.5">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center rounded-[14px] border border-dashed border-[#cbd8e8] bg-[#f8fafc] text-[13px] font-medium text-[#8b95a1]">
                  업무를 불러오는 중입니다.
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-[14px] border border-dashed border-[#cbd8e8] bg-[#f8fafc] text-[13px] font-medium text-[#8b95a1]">
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
      </ResponsiveContainer>
    </main>
  );
}

export default AllTasksPage;
