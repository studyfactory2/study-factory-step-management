"use client";

import { useCallback, useEffect, useState } from "react";
import { DoorOpen, PencilLine, Settings } from "lucide-react";
import {
  getAdminDashboard,
  readAdminDashboardCache,
  type AdminDashboard,
  type AdminDashboardSortOrder,
} from "@/api/admin";
import {
  deleteMemberPreRegistration,
  getMemberPreRegistrations,
  preRegisterMember,
  type MemberPreRegistration,
} from "@/api/member";
import {
  getTaskCategorySummary,
  readTaskCategorySummaryCache,
  type TaskCategory,
  type TaskCategorySummaryItem,
} from "@/api/task";
import {
  getNotificationUnreadCount,
  markAllNotificationsAsRead,
} from "@/api/notification";
import type { TaskStatus } from "@/types/domain";
import {
  DashboardActionSection,
  type MemberManagementView,
} from "@/components/adminDashboard/dashboard-action-section";
import { MessageBanner } from "@/components/adminDashboard/message-banner";
import { MemberPreRegisterPanel } from "@/components/adminDashboard/member-pre-register-panel";
import { PositionTreeManagementPanel } from "@/components/adminDashboard/position-tree-management-panel";
import {
  RecentOutputsSection,
  type RecentOutputScope,
} from "@/components/adminDashboard/recent-outputs-section";
import { ConfirmDialog } from "@/components/pages/dashboard/confirm-dialog";
import {
  getPositionName,
  InProgressCategorySection,
} from "@/components/pages/adminDashboard/in-progress-category-section";
import { ResponsiveContainer } from "@/components/layout/responsive-container";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

type AdminDashboardPageProps = {
  accessToken: string;
  onAllTasksOpen: () => void;
  onBoardOpen: () => void;
  onSettingsOpen: () => void;
  onTaskCreateOpen: () => void;
  onLogout: () => void;
  onNotificationOpen: () => void;
  onTaskDetailOpen: (taskId: number) => void;
};

const emptyDashboard: AdminDashboard = {
  currentMember: {
    id: 0,
    name: "관리자",
    roleType: "ADMIN",
    positionName: "관리자",
    branch: null,
  },
  employees: [],
  branchGroups: [],
  recentOutputs: [],
};

const allRecentTaskStatuses: TaskStatus[] = [
  "REGISTERED",
  "IN_PROGRESS",
  "REVIEW_REQUESTED",
  "COMPLETED",
];

const activeTaskStatuses: TaskStatus[] = [
  "REGISTERED",
  "IN_PROGRESS",
  "REVIEW_REQUESTED",
];

type ConfirmDialogState = {
  confirmLabel?: string;
  description: string;
  onConfirm: () => Promise<void>;
  title: string;
} | null;

export function AdminDashboardPage({
  accessToken,
  onAllTasksOpen,
  onBoardOpen,
  onSettingsOpen,
  onTaskCreateOpen,
  onLogout,
  onNotificationOpen,
  onTaskDetailOpen,
}: AdminDashboardPageProps) {
  const [dashboard, setDashboard] = useState<AdminDashboard>(emptyDashboard);
  const [memberPreRegistrations, setMemberPreRegistrations] = useState<
    MemberPreRegistration[]
  >([]);
  const [categorySummary, setCategorySummary] = useState<
    TaskCategorySummaryItem[]
  >([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [recentTaskStatuses] = useState<TaskStatus[]>(allRecentTaskStatuses);
  const [recentTaskSortOrder] = useState<AdminDashboardSortOrder>("LATEST");
  const [recentOutputScope, setRecentOutputScope] =
    useState<RecentOutputScope>("ALL");
  const [selectedRecentStatuses, setSelectedRecentStatuses] = useState<
    TaskStatus[]
  >([]);
  const [selectedTaskCategory, setSelectedTaskCategory] =
    useState<TaskCategory | null>(null);
  const [isMemberManagementOpen, setIsMemberManagementOpen] = useState(false);
  const [memberManagementView, setMemberManagementView] =
    useState<MemberManagementView>("menu");
  const [message, setMessage] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);
  const [isPreRegistrationLoading, setIsPreRegistrationLoading] =
    useState(false);
  const [isPreRegisterSubmitting, setIsPreRegisterSubmitting] = useState(false);

  const handleRealtimeNotification = useCallback(() => {
    setNotificationUnreadCount((currentCount) => currentCount + 1);
  }, []);

  useRealtimeNotifications(accessToken, handleRealtimeNotification);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const dashboardFilters = {
          sortOrder: recentTaskSortOrder,
          statuses: recentTaskStatuses,
        };
        const cachedDashboard = readAdminDashboardCache(
          accessToken,
          dashboardFilters,
        );
        if (cachedDashboard) {
          setDashboard(cachedDashboard);
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

        const [dashboardResponse, notificationCountResponse] =
          await Promise.all([
            getAdminDashboard(accessToken, dashboardFilters),
            getNotificationUnreadCount(accessToken),
          ]);

        setDashboard(dashboardResponse);
        setNotificationUnreadCount(notificationCountResponse.unreadCount);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "대시보드를 불러오지 못했습니다.",
        );
      }
    }

    void loadDashboard();
  }, [accessToken, recentTaskSortOrder, recentTaskStatuses]);

  async function refreshMemberPreRegistrations() {
    setIsPreRegistrationLoading(true);

    try {
      const preRegistrations = await getMemberPreRegistrations(accessToken);
      setMemberPreRegistrations(
        preRegistrations.filter(
          (preRegistration) => !preRegistration.isRegistered,
        ),
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "직원 사전등록 목록을 불러오지 못했습니다.",
      );
    } finally {
      setIsPreRegistrationLoading(false);
    }
  }

  function handleRecentStatusToggle(status: TaskStatus) {
    setSelectedRecentStatuses((currentStatuses) => {
      if (currentStatuses.includes(status)) {
        return currentStatuses.filter(
          (currentStatus) => currentStatus !== status,
        );
      }

      return [...currentStatuses, status];
    });
  }

  function handleTaskCategoryToggle(category: TaskCategory) {
    setSelectedTaskCategory((currentCategory) =>
      currentCategory === category ? null : category,
    );
  }

  async function handlePreRegister(request: {
    dutyText: string;
    joinedAt: string;
    name: string;
    organization: string;
    positionId: number;
  }) {
    setMessage("");
    setIsPreRegisterSubmitting(true);

    try {
      await preRegisterMember(accessToken, request);
      setMessage("직원 사전등록이 완료되었습니다.");
      await refreshMemberPreRegistrations();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "직원 사전등록에 실패했습니다.",
      );
    } finally {
      setIsPreRegisterSubmitting(false);
    }
  }

  function handleSelectMemberPreRegister() {
    setMemberManagementView("preRegister");
    void refreshMemberPreRegistrations();
  }

  function handleSelectPositionTree() {
    setMemberManagementView("positionTree");
  }

  function handleCloseMemberManagement() {
    setIsMemberManagementOpen(false);
    setMemberManagementView("menu");
  }

  async function deletePreRegistrationAfterConfirm(id: number) {
    setMessage("");
    setIsPreRegistrationLoading(true);

    try {
      await deleteMemberPreRegistration(accessToken, id);
      setMessage("직원 사전등록 정보가 삭제되었습니다.");
      await refreshMemberPreRegistrations();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "직원 사전등록 정보를 삭제하지 못했습니다.",
      );
    } finally {
      setIsPreRegistrationLoading(false);
    }
  }

  function handleDeletePreRegistration(id: number, name: string) {
    setConfirmDialog({
      confirmLabel: "삭제",
      description: `${name} 님의 사전등록 정보를 삭제할까요?`,
      onConfirm: () => deletePreRegistrationAfterConfirm(id),
      title: "사전등록 정보 삭제",
    });
  }

  async function handleConfirmDialog() {
    if (!confirmDialog) {
      return;
    }

    const confirmAction = confirmDialog.onConfirm;
    setConfirmDialog(null);
    await confirmAction();
  }

  async function handleNotificationOpen() {
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
              onClick={onSettingsOpen}
              type="button"
            >
              <Settings aria-hidden className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </button>
            <div className="min-w-0 text-center min-[390px]:px-1">
              <p className="truncate text-[16px] font-extrabold tracking-[-0.03em] text-[#191f28] min-[390px]:text-xl sm:text-2xl">
                안녕하세요 {dashboard.currentMember.name}{" "}
                {getPositionName(
                  dashboard.currentMember.positionName,
                  dashboard.currentMember.roleType,
                )}
                님
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
        <RecentOutputsSection
          currentMemberId={dashboard.currentMember.id}
          onAllTasksOpen={onAllTasksOpen}
          onDetailOpen={onTaskDetailOpen}
          onScopeChange={setRecentOutputScope}
          onStatusToggle={handleRecentStatusToggle}
          recentOutputs={dashboard.recentOutputs}
          selectedCategory={selectedTaskCategory}
          selectedScope={recentOutputScope}
          selectedStatuses={selectedRecentStatuses}
        />
        <DashboardActionSection
          isMemberManagementOpen={isMemberManagementOpen}
          memberManagementView={memberManagementView}
          memberPreRegisterPanel={
            <MemberPreRegisterPanel
              isLoading={isPreRegistrationLoading}
              preRegistrations={memberPreRegistrations}
              isSubmitting={isPreRegisterSubmitting}
              layout="modal"
              onClose={() => setMemberManagementView("menu")}
              onDelete={handleDeletePreRegistration}
              onSubmit={handlePreRegister}
            />
          }
          positionTreeManagementPanel={
            <PositionTreeManagementPanel
              accessToken={accessToken}
              onClose={() => setMemberManagementView("menu")}
              onMessage={setMessage}
            />
          }
          onCloseMemberManagement={handleCloseMemberManagement}
          onSelectMemberPreRegister={handleSelectMemberPreRegister}
          onSelectPositionTree={handleSelectPositionTree}
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
      {confirmDialog && (
        <ConfirmDialog
          confirmLabel={confirmDialog.confirmLabel ?? "확인"}
          description={confirmDialog.description}
          onCancel={() => setConfirmDialog(null)}
          onConfirm={handleConfirmDialog}
          title={confirmDialog.title}
        />
      )}
    </main>
  );
}

export default AdminDashboardPage;
