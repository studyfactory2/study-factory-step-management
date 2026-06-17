"use client";

import { useCallback, useEffect, useState } from "react";
import { DoorOpen, PencilLine, Settings } from "lucide-react";
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
  readTaskRecentWorkStatusCache,
  readTaskCategorySummaryCache,
  type TaskCategorySummaryItem
} from "@/api/task";
import { MessageBanner } from "@/components/adminDashboard/message-banner";
import { RecentOutputsSection } from "@/components/adminDashboard/recent-outputs-section";
import { ResponsiveContainer } from "@/components/layout/responsive-container";
import { InProgressCategorySection } from "@/components/pages/adminDashboard/in-progress-category-section";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import type { StoredMember } from "@/lib/auth-storage";
import type { TaskStatus } from "@/types/domain";

const activeTaskStatuses: TaskStatus[] = [
  "REGISTERED",
  "IN_PROGRESS",
  "REVIEW_REQUESTED"
];

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
  onLogout,
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
        const recentWorkStatusFilters = {
          sortOrder: recentTaskSortOrder,
          statuses: recentTaskStatuses
        };
        const cachedRecentOutputs = readTaskRecentWorkStatusCache(accessToken, recentWorkStatusFilters);
        if (cachedRecentOutputs) {
          setRecentOutputs(cachedRecentOutputs);
          setIsLoading(false);
        }

        const cachedCategorySummary = readTaskCategorySummaryCache({
          statuses: activeTaskStatuses
        });
        if (cachedCategorySummary) {
          setCategorySummary(cachedCategorySummary);
        }

        void getTaskCategorySummary({
          statuses: activeTaskStatuses
        })
          .then(setCategorySummary)
          .catch(() => undefined);

        const [recentOutputResponse, notificationCountResponse] = await Promise.all([
          getTaskRecentWorkStatus(accessToken, recentWorkStatusFilters),
          getNotificationUnreadCount(accessToken)
        ]);

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
      <ResponsiveContainer variant="dashboard">
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
              <p className="truncate text-[17px] font-normal text-[#222222]">
                안녕하세요 {currentMember.name}님
              </p>
              <p className="mt-1 text-[13px] font-normal text-[#7B716D]">오늘도 즐거운 하루 되세요</p>
            </div>
            <button
              aria-label="로그아웃"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8D1CE] bg-white text-[#4F4542] shadow-sm"
              onClick={onLogout}
              type="button"
            >
              <DoorOpen aria-hidden className="h-4.5 w-4.5" />
            </button>
          </div>
        </section>
        <MessageBanner message={message} />
        <InProgressCategorySection
          categorySummary={categorySummary}
          notificationUnreadCount={notificationUnreadCount}
          onBoardOpen={onBoardOpen}
          onNotificationOpen={() => void handleNotificationOpen()}
        />
        {isLoading && (
          <section className="rounded-[18px] border border-[#D8D1CE] bg-white p-5 text-center text-[15px] font-normal text-[#7B716D] shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
            최근 업무를 불러오는 중입니다.
          </section>
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
      </ResponsiveContainer>
      <button
        aria-label="새 업무 등록"
        className="fixed bottom-6 left-1/2 z-30 flex h-14 w-14 translate-x-[128px] items-center justify-center rounded-full border border-[#C7CDD4] bg-[#EAF3FF] text-[#2D70CB] shadow-[0_8px_18px_rgba(45,112,203,0.22)] max-[420px]:left-auto max-[420px]:right-5 max-[420px]:translate-x-0"
        onClick={onTaskCreateOpen}
        type="button"
      >
        <PencilLine aria-hidden className="h-6 w-6" />
      </button>
    </main>
  );
}

export default EmployeeDashboardPage;
