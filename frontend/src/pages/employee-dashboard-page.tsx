"use client";

import { useCallback, useEffect, useState } from "react";
import { DoorOpen, PencilLine, Settings } from "lucide-react";
import type {
  AdminDashboardRecentOutput,
  AdminDashboardSortOrder,
} from "@/api/admin";
import {
  getNotificationUnreadCount,
  markAllNotificationsAsRead,
} from "@/api/notification";
import {
  getTaskCategorySummary,
  getTaskRecentWorkStatus,
  readTaskRecentWorkStatusCache,
  readTaskCategorySummaryCache,
  type TaskCategory,
  type TaskCategorySummaryItem,
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
  "REVIEW_REQUESTED",
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
  onTaskDetailOpen,
}: Partial<EmployeeDashboardPageProps>) {
  const [categorySummary, setCategorySummary] = useState<
    TaskCategorySummaryItem[]
  >([]);
  const [recentOutputs, setRecentOutputs] = useState<
    AdminDashboardRecentOutput[]
  >([]);
  const [recentTaskStatuses, setRecentTaskStatuses] = useState<TaskStatus[]>([
    ...activeTaskStatuses,
  ]);
  const [recentTaskSortOrder, setRecentTaskSortOrder] =
    useState<AdminDashboardSortOrder>("LATEST");
  const [selectedTaskCategory, setSelectedTaskCategory] =
    useState<TaskCategory | null>(null);
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
          statuses: recentTaskStatuses,
        };
        const cachedRecentOutputs = readTaskRecentWorkStatusCache(
          accessToken,
          recentWorkStatusFilters,
        );
        if (cachedRecentOutputs) {
          setRecentOutputs(cachedRecentOutputs);
          setIsLoading(false);
        }

        const cachedCategorySummary = readTaskCategorySummaryCache(
          accessToken,
          {
            statuses: activeTaskStatuses,
          },
        );
        if (cachedCategorySummary) {
          setCategorySummary(cachedCategorySummary);
        }

        void getTaskCategorySummary(accessToken, {
          statuses: activeTaskStatuses,
        })
          .then(setCategorySummary)
          .catch(() => undefined);

        const [recentOutputResponse, notificationCountResponse] =
          await Promise.all([
            getTaskRecentWorkStatus(accessToken, recentWorkStatusFilters),
            getNotificationUnreadCount(accessToken),
          ]);

        setRecentOutputs(recentOutputResponse);
        setNotificationUnreadCount(notificationCountResponse.unreadCount);
        setMessage("");
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "직원 대시보드를 불러오지 못했습니다.",
        );
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

        return currentStatuses.filter(
          (currentStatus) => currentStatus !== status,
        );
      }

      return [...currentStatuses, status];
    });
  }

  function handleRecentTaskSortToggle() {
    setRecentTaskSortOrder((currentSortOrder) =>
      currentSortOrder === "LATEST" ? "OLDEST" : "LATEST",
    );
  }

  function handleTaskCategoryToggle(category: TaskCategory) {
    setSelectedTaskCategory((currentCategory) =>
      currentCategory === category ? null : category,
    );
  }

  async function handleNotificationOpen() {
    if (!accessToken || !onNotificationOpen) {
      return;
    }

    try {
      await markAllNotificationsAsRead(accessToken);
      setNotificationUnreadCount(0);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "알림을 읽음 처리하지 못했습니다.",
      );
    } finally {
      onNotificationOpen();
    }
  }

  if (
    !accessToken ||
    !currentMember ||
    !onAllTasksOpen ||
    !onBoardOpen ||
    !onNotificationOpen ||
    !onTaskCreateOpen ||
    !onTaskDetailOpen
  ) {
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
      <ResponsiveContainer
        className="relative z-10 space-y-5"
        variant="dashboard"
      >
        <section className="surface-card bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(238,246,255,0.96)_58%,rgba(245,241,255,0.96)_100%)] px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 min-[390px]:gap-3">
            <button
              aria-label="설정"
              className="icon-button"
              onClick={() => setMessage("직원 설정 기능은 준비 중입니다.")}
              type="button"
            >
              <Settings aria-hidden className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </button>
            <div className="min-w-0 text-center min-[390px]:px-1">
              <p className="truncate text-[16px] font-extrabold tracking-[-0.03em] text-[#191f28] min-[390px]:text-xl sm:text-2xl">
                안녕하세요 {currentMember.name}님
              </p>
              <p className="mt-1 whitespace-nowrap text-[11px] font-medium text-[#8b95a1] min-[390px]:text-sm sm:text-[15px]">
                오늘 해야 할 업무를 확인해보세요
              </p>
            </div>
            <button
              aria-label="로그아웃"
              className="icon-button"
              onClick={onLogout}
              type="button"
            >
              <DoorOpen aria-hidden className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </button>
          </div>
        </section>
        <MessageBanner message={message} />
        <InProgressCategorySection
          categorySummary={categorySummary}
          notificationUnreadCount={notificationUnreadCount}
          onBoardOpen={onBoardOpen}
          onCategoryToggle={handleTaskCategoryToggle}
          onNotificationOpen={() => void handleNotificationOpen()}
          selectedCategory={selectedTaskCategory}
        />
        {isLoading && (
          <section className="surface-card p-6 text-center text-[15px] font-medium text-[#8b95a1] sm:text-[16px]">
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
          selectedCategory={selectedTaskCategory}
          selectedScope="MINE"
          selectedSortOrder={recentTaskSortOrder}
          selectedStatuses={recentTaskStatuses}
          showScopeSelector={false}
        />
      </ResponsiveContainer>
      <button
        aria-label="새 업무 등록"
        className="fixed bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#3182f6_0%,#6b5cff_100%)] text-white shadow-[0_10px_24px_rgba(49,130,246,0.36)] transition hover:brightness-95 active:scale-95 sm:h-16 sm:w-16"
        onClick={onTaskCreateOpen}
        style={{
          right:
            "max(1.25rem, calc((100vw - min(calc(100vw - 1.5rem), 72rem)) / 2 + 1rem))",
        }}
        type="button"
      >
        <PencilLine aria-hidden className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>
    </main>
  );
}

export default EmployeeDashboardPage;
