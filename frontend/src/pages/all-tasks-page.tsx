"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
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
    <main className="min-h-dvh overflow-hidden bg-background px-4 py-8 text-foreground sm:px-8">
      <div className="pointer-events-none fixed left-10 top-20 text-[#F0C957]">
        <Sparkles aria-hidden className="h-9 w-9 fill-current" />
      </div>
      <div className="pointer-events-none fixed right-12 top-28 text-[#F1A9C0]">
        <Sparkles aria-hidden className="h-8 w-8 fill-current" />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] space-y-7">
        <AllTasksHeader isAdmin={isAdmin} onBack={onBack} taskCount={tasks.length} />

        <section className="rounded-[24px] border border-[#F2C9C2] bg-[#FFFEFC] px-6 py-6 shadow-[0_8px_0_#EFC6BE]">
          <AllTasksFilterBar
            onSortToggle={() => setSortOrder((current) => (current === "LATEST" ? "OLDEST" : "LATEST"))}
            onStatusToggle={handleStatusToggle}
            selectedStatuses={selectedStatuses}
            sortOrder={sortOrder}
          />

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

export default AllTasksPage;
