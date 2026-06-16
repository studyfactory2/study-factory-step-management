"use client";

import { useCallback, useEffect, useState } from "react";
import { PencilLine, Settings } from "lucide-react";
import {
  getAdminDashboard,
  type AdminDashboard,
  type AdminDashboardSortOrder
} from "@/api/admin";
import {
  deleteMemberPreRegistration,
  getMemberPreRegistrations,
  preRegisterMember,
  type MemberPreRegistration
} from "@/api/member";
import {
  getTaskCategorySummary,
  type TaskCategorySummaryItem
} from "@/api/task";
import {
  getNotificationUnreadCount,
  markAllNotificationsAsRead
} from "@/api/notification";
import type { TaskStatus } from "@/types/domain";
import {
  DashboardActionSection,
  type MemberManagementView
} from "@/components/adminDashboard/dashboard-action-section";
import { DashboardLogout } from "@/components/adminDashboard/dashboard-logout";
import { MessageBanner } from "@/components/adminDashboard/message-banner";
import { MemberPreRegisterPanel } from "@/components/adminDashboard/member-pre-register-panel";
import { PositionTreeManagementPanel } from "@/components/adminDashboard/position-tree-management-panel";
import {
  RecentOutputsSection,
  type RecentOutputScope
} from "@/components/adminDashboard/recent-outputs-section";
import { ConfirmDialog } from "@/components/pages/dashboard/confirm-dialog";
import {
  getPositionName,
  InProgressCategorySection
} from "@/components/pages/adminDashboard/in-progress-category-section";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

type AdminDashboardPageProps = {
  accessToken: string;
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
    branch: null
  },
  employees: [],
  branchGroups: [],
  recentOutputs: []
};

const allRecentTaskStatuses: TaskStatus[] = [
  "REGISTERED",
  "IN_PROGRESS",
  "REVIEW_REQUESTED",
  "COMPLETED"
];

type ConfirmDialogState = {
  confirmLabel?: string;
  description: string;
  onConfirm: () => Promise<void>;
  title: string;
} | null;

export function AdminDashboardPage({
  accessToken,
  onBoardOpen,
  onSettingsOpen,
  onTaskCreateOpen,
  onLogout,
  onNotificationOpen,
  onTaskDetailOpen
}: AdminDashboardPageProps) {
  const [dashboard, setDashboard] = useState<AdminDashboard>(emptyDashboard);
  const [memberPreRegistrations, setMemberPreRegistrations] = useState<MemberPreRegistration[]>([]);
  const [categorySummary, setCategorySummary] = useState<TaskCategorySummaryItem[]>([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [recentTaskStatuses] = useState<TaskStatus[]>(allRecentTaskStatuses);
  const [recentTaskSortOrder] = useState<AdminDashboardSortOrder>("LATEST");
  const [recentOutputScope, setRecentOutputScope] = useState<RecentOutputScope>("ALL");
  const [selectedRecentStatuses, setSelectedRecentStatuses] = useState<TaskStatus[]>([]);
  const [isMemberManagementOpen, setIsMemberManagementOpen] = useState(false);
  const [memberManagementView, setMemberManagementView] = useState<MemberManagementView>("menu");
  const [message, setMessage] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);
  const [isPreRegistrationLoading, setIsPreRegistrationLoading] = useState(false);
  const [isPreRegisterSubmitting, setIsPreRegisterSubmitting] = useState(false);

  const handleRealtimeNotification = useCallback(() => {
    setNotificationUnreadCount((currentCount) => currentCount + 1);
  }, []);

  useRealtimeNotifications(accessToken, handleRealtimeNotification);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          dashboardResponse,
          categorySummaryResponse,
          notificationCountResponse
        ] = await Promise.all([
          getAdminDashboard(accessToken, {
            sortOrder: recentTaskSortOrder,
            statuses: recentTaskStatuses
          }),
          getTaskCategorySummary({
            statuses: ["IN_PROGRESS"]
          }),
          getNotificationUnreadCount(accessToken)
        ]);

        setDashboard(dashboardResponse);
        setCategorySummary(categorySummaryResponse);
        setNotificationUnreadCount(notificationCountResponse.unreadCount);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "대시보드를 불러오지 못했습니다.");
      }
    }

    void loadDashboard();
  }, [accessToken, recentTaskSortOrder, recentTaskStatuses]);

  async function refreshMemberPreRegistrations() {
    setIsPreRegistrationLoading(true);

    try {
      const preRegistrations = await getMemberPreRegistrations(accessToken);
      setMemberPreRegistrations(preRegistrations.filter((preRegistration) => !preRegistration.isRegistered));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "직원 사전등록 목록을 불러오지 못했습니다.");
    } finally {
      setIsPreRegistrationLoading(false);
    }
  }

  function handleRecentStatusToggle(status: TaskStatus) {
    setSelectedRecentStatuses((currentStatuses) => {
      if (currentStatuses.includes(status)) {
        return currentStatuses.filter((currentStatus) => currentStatus !== status);
      }

      return [...currentStatuses, status];
    });
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
      setMessage(error instanceof Error ? error.message : "직원 사전등록에 실패했습니다.");
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
      setMessage(error instanceof Error ? error.message : "직원 사전등록 정보를 삭제하지 못했습니다.");
    } finally {
      setIsPreRegistrationLoading(false);
    }
  }

  function handleDeletePreRegistration(id: number, name: string) {
    setConfirmDialog({
      confirmLabel: "삭제",
      description: `${name} 님의 사전등록 정보를 삭제할까요?`,
      onConfirm: () => deletePreRegistrationAfterConfirm(id),
      title: "사전등록 정보 삭제"
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
      setMessage(error instanceof Error ? error.message : "알림을 읽음 처리하지 못했습니다.");
    } finally {
      onNotificationOpen();
    }
  }

  return (
    <main className="login-pdf-font min-h-dvh overflow-hidden bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <div className="relative mx-auto w-full max-w-[360px] space-y-3">
        <section className="rounded-[20px] border border-[#D8D1CE] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-2">
            <button
              aria-label="설정"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8D1CE] bg-white text-[#4F4542] shadow-sm"
              onClick={onSettingsOpen}
              type="button"
            >
              <Settings aria-hidden className="h-4.5 w-4.5" />
            </button>
            <div className="min-w-0 text-center">
              <p className="truncate text-[15px] font-normal text-[#222222]">
                안녕하세요 {dashboard.currentMember.name} {getPositionName(dashboard.currentMember.positionName, dashboard.currentMember.roleType)}님
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
        <InProgressCategorySection
          categorySummary={categorySummary}
          notificationUnreadCount={notificationUnreadCount}
          onBoardOpen={onBoardOpen}
          onNotificationOpen={() => void handleNotificationOpen()}
        />
        <RecentOutputsSection
          currentMemberId={dashboard.currentMember.id}
          onDetailOpen={onTaskDetailOpen}
          onScopeChange={setRecentOutputScope}
          onStatusToggle={handleRecentStatusToggle}
          recentOutputs={dashboard.recentOutputs}
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
        <DashboardLogout onLogout={onLogout} />
      </div>
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
