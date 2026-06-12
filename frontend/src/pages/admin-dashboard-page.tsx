"use client";

import { useEffect, useState } from "react";
import { Bell, ClipboardList, PencilLine, Settings } from "lucide-react";
import {
  getAdminDashboard,
  type AdminDashboard,
  type AdminDashboardSortOrder
} from "@/api/admin";
import {
  deleteMemberPreRegistration,
  getMemberPreRegistrations,
  getMembers,
  preRegisterMember,
  type MemberPreRegistration
} from "@/api/member";
import {
  createTask,
  getTaskCategorySummary,
  type TaskCategorySummaryItem
} from "@/api/task";
import type { Member, TaskStatus } from "@/types/domain";
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
import { TaskCreateForm, type TaskCreateDraftSubmit } from "@/components/adminDashboard/task-create-form";
import { isAssignableMember } from "@/components/adminDashboard/utils";
import { ConfirmDialog } from "@/components/pages/dashboard/confirm-dialog";
import { roleLabels } from "@/components/adminDashboard/constants";

type AdminDashboardPageProps = {
  accessToken: string;
  onLogout: () => void;
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

const categoryLabels = {
  DEVELOPMENT: "개발관련",
  OPERATION: "운영관련",
  MEMBER: "회원관련",
  ORDER: "주문관련"
} as const;

const categoryColorClassNames = {
  DEVELOPMENT: "text-[#2D70CB]",
  OPERATION: "text-[#E30613]",
  MEMBER: "text-[#8B72C8]",
  ORDER: "text-[#D0A112]"
} as const;

type ConfirmDialogState = {
  confirmLabel?: string;
  description: string;
  onConfirm: () => Promise<void>;
  title: string;
} | null;

export function AdminDashboardPage({
  accessToken,
  onLogout,
  onTaskDetailOpen
}: AdminDashboardPageProps) {
  const [dashboard, setDashboard] = useState<AdminDashboard>(emptyDashboard);
  const [memberPreRegistrations, setMemberPreRegistrations] = useState<MemberPreRegistration[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [categorySummary, setCategorySummary] = useState<TaskCategorySummaryItem[]>([]);
  const [recentTaskStatuses] = useState<TaskStatus[]>(allRecentTaskStatuses);
  const [recentTaskSortOrder] = useState<AdminDashboardSortOrder>("LATEST");
  const [recentOutputScope, setRecentOutputScope] = useState<RecentOutputScope>("ALL");
  const [selectedRecentStatuses, setSelectedRecentStatuses] = useState<TaskStatus[]>([]);
  const [isMemberManagementOpen, setIsMemberManagementOpen] = useState(false);
  const [memberManagementView, setMemberManagementView] = useState<MemberManagementView>("menu");
  const [isTaskCreateOpen, setIsTaskCreateOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreRegistrationLoading, setIsPreRegistrationLoading] = useState(false);
  const [isPreRegisterSubmitting, setIsPreRegisterSubmitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          dashboardResponse,
          memberResponse,
          categorySummaryResponse
        ] = await Promise.all([
          getAdminDashboard(accessToken, {
            sortOrder: recentTaskSortOrder,
            statuses: recentTaskStatuses
          }),
          getMembers(),
          getTaskCategorySummary({
            statuses: ["IN_PROGRESS"]
          })
        ]);

        setDashboard(dashboardResponse);
        setMembers(memberResponse.filter(isAssignableMember));
        setCategorySummary(categorySummaryResponse);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "대시보드를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [accessToken, recentTaskSortOrder, recentTaskStatuses]);

  async function refreshDashboard() {
    const dashboardResponse = await getAdminDashboard(accessToken, {
      sortOrder: recentTaskSortOrder,
      statuses: recentTaskStatuses
    });
    setDashboard(dashboardResponse);
    setCategorySummary(await getTaskCategorySummary({ statuses: ["IN_PROGRESS"] }));
  }

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

  async function handleCreateTask(request: TaskCreateDraftSubmit) {
    setMessage("");

    setIsSubmitting(true);
    try {
      await createTask(accessToken, {
        title: request.title,
        description: request.description,
        category: request.category,
        oneLineComment: request.oneLineComment,
        attachments: request.attachments,
        assigneeScope: "SINGLE",
        assigneeId: request.assigneeId
      });
      setMessage("업무가 등록되었습니다.");
      setIsTaskCreateOpen(false);
      await refreshDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "업무를 등록하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePreRegister(request: {
    branch: string;
    name: string;
    positionDutyId: number;
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

  function handleOpenMemberManagement() {
    setMemberManagementView("menu");
    setIsMemberManagementOpen(true);
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

  return (
    <main className="login-pdf-font min-h-dvh overflow-hidden bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <div className="relative mx-auto w-full max-w-[360px] space-y-3">
        <section className="rounded-[20px] border border-[#D8D1CE] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-2">
            <button
              aria-label="설정"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8D1CE] bg-white text-[#4F4542] shadow-sm"
              onClick={handleOpenMemberManagement}
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
              onClick={() => setIsTaskCreateOpen(true)}
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
        <InProgressCategorySection categorySummary={categorySummary} />
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
      {isTaskCreateOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#3F2C28]/30 px-3 py-5">
          <div className="max-h-[calc(100dvh-40px)] w-full max-w-[390px] overflow-y-auto rounded-[20px] border border-[#D8D1CE] bg-[#FFFEFC] p-3 shadow-[0_18px_44px_rgba(90,62,59,0.18)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-normal text-[#222222]">새 업무 등록</h2>
              <button
                className="h-8 rounded-[9px] border border-[#D8D1CE] bg-white px-3 text-[10px] font-normal text-[#4F4542]"
                onClick={() => setIsTaskCreateOpen(false)}
                type="button"
              >
                닫기
              </button>
            </div>
            <TaskCreateForm
              accessToken={accessToken}
              assignees={members}
              isLoading={isLoading}
              isSubmitting={isSubmitting}
              onPublished={refreshDashboard}
              onSubmit={handleCreateTask}
            />
          </div>
        </div>
      )}
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

function InProgressCategorySection({
  categorySummary
}: {
  categorySummary: TaskCategorySummaryItem[];
}) {
  const summaryMap = new Map(categorySummary.map((item) => [item.category, item.count]));

  return (
    <section className="rounded-[18px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[16px] font-normal text-[#222222]">
          <ClipboardList aria-hidden className="h-4 w-4 text-[#7B716D]" />
          진행중 업무
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-[#FFF1E8] px-2 py-0.5 text-[9px] font-normal text-[#B97A67]">
            화이팅!
          </span>
          <button
            aria-label="내 알림"
            className="flex h-6 min-w-6 items-center justify-center gap-0.5 rounded-full border border-[#E4DCD9] bg-white px-1.5 text-[8px] font-normal text-[#4F4542]"
            type="button"
          >
            <Bell aria-hidden className="h-3 w-3 text-[#E30613]" />
            나
          </button>
          <button
            aria-label="직원 알림"
            className="flex h-6 min-w-6 items-center justify-center gap-0.5 rounded-full border border-[#E4DCD9] bg-white px-1.5 text-[8px] font-normal text-[#4F4542]"
            type="button"
          >
            <Bell aria-hidden className="h-3 w-3 text-[#2D70CB]" />
            직원
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {Object.entries(categoryLabels).map(([category, label]) => (
          <article
            className="flex min-h-[58px] flex-col items-center justify-center rounded-[10px] border border-dashed border-[#E4DCD9] bg-white px-1 text-center"
            key={category}
          >
            <p className="break-keep text-[9px] font-normal leading-3 text-[#4F4542]">{label}</p>
            <p className={`mt-1 text-[17px] font-normal leading-none ${categoryColorClassNames[category as keyof typeof categoryColorClassNames]}`}>
              {summaryMap.get(category as keyof typeof categoryLabels) ?? 0}건
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function getPositionName(positionName: string | null, roleType: AdminDashboard["currentMember"]["roleType"]) {
  return positionName ?? roleLabels[roleType];
}

export default AdminDashboardPage;
