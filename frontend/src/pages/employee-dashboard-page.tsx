"use client";

import { useCallback, useEffect, useState } from "react";
import { PencilLine, Settings } from "lucide-react";
import type {
  AdminDashboardRecentOutput,
  AdminDashboardSortOrder
} from "@/api/admin";
import {
  getNotificationUnreadCount,
  markAllNotificationsAsRead
} from "@/api/notification";
import {
  getTaskCategorySummary,
  getTaskRecentWorkStatus,
  type TaskCategorySummaryItem
} from "@/api/task";
import { MessageBanner } from "@/components/adminDashboard/message-banner";
import { RecentOutputsSection } from "@/components/adminDashboard/recent-outputs-section";
import { InProgressCategorySection } from "@/components/pages/adminDashboard/in-progress-category-section";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import type { StoredMember } from "@/lib/auth-storage";
import type { TaskStatus } from "@/types/domain";

type EmployeeDashboardPageProps = {
  accessToken: string;
  currentMember: StoredMember;
  onAllTasksOpen: () => void;
  onBoardOpen: () => void;
  onNotificationOpen: () => void;
  onLogout: () => void;
  onTaskCreateOpen: () => void;
  onTaskDetailOpen: (taskId: number) => void;
};

export function EmployeeDashboardPage({
  accessToken,
  currentMember,
  onAllTasksOpen,
  onBoardOpen,
  onNotificationOpen,
  onTaskCreateOpen,
  onTaskDetailOpen
}: Partial<EmployeeDashboardPageProps>) {
  const [categorySummary, setCategorySummary] = useState<TaskCategorySummaryItem[]>([]);
  const [recentOutputs, setRecentOutputs] = useState<AdminDashboardRecentOutput[]>([]);
  const [recentTaskStatuses, setRecentTaskStatuses] = useState<TaskStatus[]>(["REVIEW_REQUESTED"]);
  const [recentTaskSortOrder, setRecentTaskSortOrder] = useState<AdminDashboardSortOrder>("LATEST");
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleRealtimeNotification = useCallback(() => {
    setNotificationUnreadCount((currentCount) => currentCount + 1);
  }, []);

  useRealtimeNotifications(accessToken, handleRealtimeNotification);

  useEffect(() => {
    async function loadDashboard() {
      if (!accessToken) {
        return;
      }

      try {
        const [categorySummaryResponse, recentOutputResponse, notificationCountResponse] = await Promise.all([
          getTaskCategorySummary({
            statuses: ["IN_PROGRESS"]
          }),
          getTaskRecentWorkStatus(accessToken, {
            sortOrder: recentTaskSortOrder,
            statuses: recentTaskStatuses
          }),
          getNotificationUnreadCount(accessToken)
        ]);

        setCategorySummary(categorySummaryResponse);
        setRecentOutputs(recentOutputResponse);
        setNotificationUnreadCount(notificationCountResponse.unreadCount);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "직원 대시보드를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [accessToken, recentTaskSortOrder, recentTaskStatuses]);

  function handleRecentTaskStatusToggle(status: TaskStatus) {
    setRecentTaskStatuses((currentStatuses) => {
      if (currentStatuses.includes(status)) {
        if (currentStatuses.length === 1) {
          return currentStatuses;
        }

        return currentStatuses.filter((currentStatus) => currentStatus !== status);
      }

      return [...currentStatuses, status];
    });
  }

  function handleRecentTaskSortToggle() {
    setRecentTaskSortOrder((currentSortOrder) => (currentSortOrder === "LATEST" ? "OLDEST" : "LATEST"));
  }

  async function handleNotificationOpen() {
    if (!accessToken || !onNotificationOpen) {
      return;
    }

    try {
      await markAllNotificationsAsRead(accessToken);
      setNotificationUnreadCount(0);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "알림을 읽음 처리하지 못했습니다.");
    } finally {
      onNotificationOpen();
    }
  }

  if (
    !accessToken
    || !currentMember
    || !onAllTasksOpen
    || !onBoardOpen
    || !onNotificationOpen
    || !onTaskCreateOpen
    || !onTaskDetailOpen
  ) {
    return null;
  }

  return (
    <main className="login-pdf-font min-h-dvh overflow-hidden bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <div className="relative mx-auto w-full max-w-[360px] space-y-3">
        <section className="rounded-[20px] border border-[#D8D1CE] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-2">
            <button
              aria-label="설정"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8D1CE] bg-white text-[#4F4542] shadow-sm"
              onClick={() => setMessage("직원 설정 기능은 준비 중입니다.")}
              type="button"
            >
              <Settings aria-hidden className="h-4.5 w-4.5" />
            </button>
            <div className="min-w-0 text-center">
              <p className="truncate text-[15px] font-normal text-[#222222]">
                안녕하세요 {currentMember.name}님
              </p>
              <p className="mt-1 text-[11px] font-normal text-[#7B716D]">오늘도 즐거운 하루 되세요</p>
            </div>
            <button
              className="flex h-8 items-center justify-center rounded-[8px] border border-[#C7CDD4] bg-[#EAF3FF] px-1 text-[8px] font-normal text-[#2D70CB] shadow-[0_1px_4px_rgba(45,112,203,0.08)]"
              onClick={onTaskCreateOpen}
              type="button"
            >
              <span className="mr-1 inline-flex">
                <PencilLine aria-hidden className="h-2.5 w-2.5" />
              </span>
              새 업무 등록
            </button>
          </div>
        </section>
        <MessageBanner message={message} />
        {isLoading ? (
          <section className="rounded-[18px] border border-[#D8D1CE] bg-white p-5 text-center text-[13px] font-normal text-[#7B716D] shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
            직원 대시보드를 불러오는 중입니다.
          </section>
        ) : (
          <InProgressCategorySection
            categorySummary={categorySummary}
            notificationUnreadCount={notificationUnreadCount}
            onBoardOpen={onBoardOpen}
            onNotificationOpen={() => void handleNotificationOpen()}
          />
        )}
        <RecentOutputsSection
          currentMemberId={currentMember.id}
          onAllTasksOpen={onAllTasksOpen}
          onDetailOpen={onTaskDetailOpen}
          onSortOrderToggle={handleRecentTaskSortToggle}
          onStatusToggle={handleRecentTaskStatusToggle}
          recentOutputs={recentOutputs}
          selectedScope="MINE"
          selectedSortOrder={recentTaskSortOrder}
          selectedStatuses={recentTaskStatuses}
          showScopeSelector={false}
        />
      </div>

    </main>
  );
}

export default EmployeeDashboardPage;
