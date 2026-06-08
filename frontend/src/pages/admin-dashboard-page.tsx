"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  getAdminDashboard,
  type AdminDashboard,
  type AdminDashboardEmployee,
  type AdminDashboardSortOrder
} from "@/api/admin";
import {
  addFavoriteMember,
  deleteFavoriteMember,
  getFavoriteMemberCandidates
} from "@/api/favorite-member";
import {
  deleteMemberPreRegistration,
  getMemberPreRegistrations,
  getMembers,
  preRegisterMember,
  type MemberPreRegistration
} from "@/api/member";
import { createTask } from "@/api/task";
import type {
  Member,
  MemberAffiliation,
  MemberDuty,
  MemberPosition,
  TaskStatus
} from "@/types/domain";
import {
  DashboardActionSection,
  type MemberManagementView
} from "@/components/adminDashboard/dashboard-action-section";
import { DashboardHeader } from "@/components/adminDashboard/dashboard-header";
import { DashboardLogout } from "@/components/adminDashboard/dashboard-logout";
import { EmployeeListSection } from "@/components/adminDashboard/employee-list-section";
import { GreetingCard } from "@/components/adminDashboard/greeting-card";
import { MessageBanner } from "@/components/adminDashboard/message-banner";
import { MemberPreRegisterPanel } from "@/components/adminDashboard/member-pre-register-panel";
import { RecentOutputsSection } from "@/components/adminDashboard/recent-outputs-section";
import { TaskCreateForm } from "@/components/adminDashboard/task-create-form";
import { ALL_ASSIGNEES_VALUE } from "@/components/adminDashboard/constants";
import { isAssignableMember } from "@/components/adminDashboard/utils";

type AdminDashboardPageProps = {
  accessToken: string;
  onLogout: () => void;
};

const emptyDashboard: AdminDashboard = {
  currentMember: {
    id: 0,
    name: "관리자",
    roleType: "ADMIN",
    branch: null
  },
  employees: [],
  branchGroups: [],
  recentOutputs: []
};

type ConfirmDialogState = {
  confirmLabel?: string;
  description: string;
  onConfirm: () => Promise<void>;
  title: string;
} | null;

export function AdminDashboardPage({ accessToken, onLogout }: AdminDashboardPageProps) {
  const [dashboard, setDashboard] = useState<AdminDashboard>(emptyDashboard);
  const [favoriteCandidates, setFavoriteCandidates] = useState<AdminDashboardEmployee[]>([]);
  const [memberPreRegistrations, setMemberPreRegistrations] = useState<MemberPreRegistration[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [selectedAssigneePositionId, setSelectedAssigneePositionId] = useState("");
  const [recentTaskStatuses, setRecentTaskStatuses] = useState<TaskStatus[]>(["REVIEW_REQUESTED"]);
  const [recentTaskSortOrder, setRecentTaskSortOrder] = useState<AdminDashboardSortOrder>("LATEST");
  const [isMemberManagementOpen, setIsMemberManagementOpen] = useState(false);
  const [memberManagementView, setMemberManagementView] = useState<MemberManagementView>("menu");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreRegistrationLoading, setIsPreRegistrationLoading] = useState(false);
  const [isPreRegisterSubmitting, setIsPreRegisterSubmitting] = useState(false);
  const [isFavoriteUpdating, setIsFavoriteUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashboardResponse, favoriteCandidateResponse, memberResponse] = await Promise.all([
          getAdminDashboard(accessToken, {
            sortOrder: recentTaskSortOrder,
            statuses: recentTaskStatuses
          }),
          getFavoriteMemberCandidates(accessToken),
          getMembers()
        ]);

        setDashboard(dashboardResponse);
        setFavoriteCandidates(favoriteCandidateResponse);
        setMembers(memberResponse.filter(isAssignableMember));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "대시보드를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [accessToken, recentTaskSortOrder, recentTaskStatuses]);

  const branches = useMemo(() => {
    const values = members.map((member) => member.branch).filter((branch): branch is string => !!branch);
    return Array.from(new Set(values));
  }, [members]);

  const assignees = useMemo(() => {
    return members.filter((member) => {
      const isSameBranch = !selectedBranch || member.branch === selectedBranch;
      return isSameBranch;
    });
  }, [members, selectedBranch]);

  async function refreshDashboard() {
    const dashboardResponse = await getAdminDashboard(accessToken, {
      sortOrder: recentTaskSortOrder,
      statuses: recentTaskStatuses
    });
    setDashboard(dashboardResponse);
  }

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

  async function handleAddFavoriteMember(memberId: number) {
    setMessage("");
    setIsFavoriteUpdating(true);

    try {
      const employees = await addFavoriteMember(accessToken, memberId);
      setDashboard((currentDashboard) => ({
        ...currentDashboard,
        employees
      }));
      setMessage("함께 프로젝트 중 직원이 추가되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "함께 프로젝트 중 직원을 추가하지 못했습니다.");
    } finally {
      setIsFavoriteUpdating(false);
    }
  }

  async function deleteFavoriteMemberAfterConfirm(memberId: number) {
    setMessage("");
    setIsFavoriteUpdating(true);

    try {
      const employees = await deleteFavoriteMember(accessToken, memberId);
      setDashboard((currentDashboard) => ({
        ...currentDashboard,
        employees
      }));
      setMessage("함께 프로젝트 중 직원이 삭제되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "함께 프로젝트 중 직원을 삭제하지 못했습니다.");
    } finally {
      setIsFavoriteUpdating(false);
    }
  }

  function handleDeleteFavoriteMember(memberId: number, memberName: string) {
    setConfirmDialog({
      confirmLabel: "삭제",
      description: `${memberName} 님을 함께 프로젝트 중에서 삭제할까요?`,
      onConfirm: () => deleteFavoriteMemberAfterConfirm(memberId),
      title: "함께 프로젝트 중 직원 삭제"
    });
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!selectedAssigneeId) {
      setMessage("직원을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask(accessToken, {
        title,
        description,
        assigneeScope: selectedAssigneeId === ALL_ASSIGNEES_VALUE ? "ALL" : "SINGLE",
        ...(selectedAssigneeId === ALL_ASSIGNEES_VALUE
          ? {
              ...(selectedBranch ? { branch: selectedBranch } : {}),
              ...(selectedAssigneePositionId ? { positionId: Number(selectedAssigneePositionId) } : {})
            }
          : { assigneeId: Number(selectedAssigneeId) })
      });
      setTitle("");
      setDescription("");
      setSelectedAssigneeId("");
      setSelectedAssigneePositionId("");
      setMessage("업무가 등록되었습니다.");
      await refreshDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "업무를 등록하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBranchChange(value: string) {
    setSelectedBranch(value);
    setSelectedAssigneeId("");
    setSelectedAssigneePositionId("");
  }

  async function handlePreRegister(request: {
    affiliation: MemberAffiliation;
    branch: string;
    duty: MemberDuty;
    name: string;
    position: MemberPosition;
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
    setIsMemberManagementOpen(false);
    setMemberManagementView("menu");
    setMessage("로그인 화면 트리 관리는 다음 단계에서 연결할 예정입니다.");
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
    <main className="min-h-dvh overflow-hidden bg-background px-4 py-8 text-foreground sm:px-8">
      <div className="pointer-events-none fixed left-10 top-20 text-[#F0C957]">
        <Sparkles aria-hidden className="h-9 w-9 fill-current" />
      </div>
      <div className="pointer-events-none fixed right-12 top-28 text-[#F1A9C0]">
        <Sparkles aria-hidden className="h-8 w-8 fill-current" />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] space-y-7">
        <DashboardHeader roleType={dashboard.currentMember.roleType} />
        <GreetingCard memberName={dashboard.currentMember.name} />
        <MessageBanner message={message} />
        <EmployeeListSection
          candidates={favoriteCandidates}
          employees={dashboard.employees}
          isUpdating={isFavoriteUpdating}
          onAddFavoriteMember={handleAddFavoriteMember}
          onDeleteFavoriteMember={handleDeleteFavoriteMember}
        />
        <TaskCreateForm
          assignees={assignees}
          branches={branches}
          description={description}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          onAssigneeChange={setSelectedAssigneeId}
          onBranchChange={handleBranchChange}
          onDescriptionChange={setDescription}
          onPositionChange={setSelectedAssigneePositionId}
          onSubmit={handleCreateTask}
          onTitleChange={setTitle}
          selectedAssigneePositionId={selectedAssigneePositionId}
          selectedAssigneeId={selectedAssigneeId}
          selectedBranch={selectedBranch}
          title={title}
        />
        <RecentOutputsSection
          onSortOrderToggle={handleRecentTaskSortToggle}
          onStatusToggle={handleRecentTaskStatusToggle}
          recentOutputs={dashboard.recentOutputs}
          selectedSortOrder={recentTaskSortOrder}
          selectedStatuses={recentTaskStatuses}
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
          onCloseMemberManagement={handleCloseMemberManagement}
          onOpenMemberManagement={handleOpenMemberManagement}
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

function ConfirmDialog({
  confirmLabel,
  description,
  onCancel,
  onConfirm,
  title
}: {
  confirmLabel: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#3F2C28]/35 px-4">
      <div className="w-full max-w-[420px] rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] p-7 text-center shadow-[0_18px_44px_rgba(90,62,59,0.2)]">
        <p className="text-2xl font-black text-[#3F2C28]">{title}</p>
        <p className="mt-3 text-sm font-bold leading-6 text-[#8F7470]">{description}</p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            className="h-11 rounded-full border border-[#F0B9C8] bg-white text-sm font-black text-primary"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="h-11 rounded-full bg-primary text-sm font-black text-white shadow-sm"
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
