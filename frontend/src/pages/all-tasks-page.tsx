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
    <main className="min-h-dvh overflow-hidden bg-background px-3 py-4 text-foreground">
      <div className="pointer-events-none fixed left-10 top-20 text-[#F0C957]">
        <Sparkles aria-hidden className="h-9 w-9 fill-current" />
      </div>
      <div className="pointer-events-none fixed right-12 top-28 text-[#F1A9C0]">
        <Sparkles aria-hidden className="h-8 w-8 fill-current" />
      </div>

      <ResponsiveContainer variant="detail">
        <AllTasksHeader isAdmin={isAdmin} onBack={onBack} taskCount={tasks.length} />

        <section className="rounded-[20px] border border-[#F2C9C2] bg-[#FFFEFC] px-3 py-3 shadow-[0_5px_0_#EFC6BE]">
          <AllTasksFilterBar
            onSortToggle={() => setSortOrder((current) => (current === "LATEST" ? "OLDEST" : "LATEST"))}
            onStatusToggle={handleStatusToggle}
            selectedStatuses={selectedStatuses}
            sortOrder={sortOrder}
          />

          {message && (
            <div className="mt-3 rounded-[14px] border border-[#F2C9C2] bg-[#FFF8F9] px-3 py-2 text-[13px] font-black text-primary">
              {message}
            </div>
          )}

          <div className="mt-3 rounded-[16px] border border-[#F2C9C2] bg-white p-2">
            <div className="max-h-[calc(100dvh-220px)] min-h-[330px] space-y-2.5 overflow-y-auto pr-1.5">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center rounded-[14px] border border-dashed border-[#F2C9C2] bg-[#FFF8F6] text-[13px] font-semibold text-[#9B7A75]">
                  업무를 불러오는 중입니다.
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-[14px] border border-dashed border-[#F2C9C2] bg-[#FFF8F6] text-[13px] font-semibold text-[#9B7A75]">
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
