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
import { getMembers, preRegisterMember } from "@/api/member";
import { createTask } from "@/api/task";
import type {
  Member,
  MemberAffiliation,
  MemberDuty,
  MemberPosition,
  TaskStatus
} from "@/types/domain";
import { DashboardActionSection } from "@/components/adminDashboard/dashboard-action-section";
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

export function AdminDashboardPage({ accessToken, onLogout }: AdminDashboardPageProps) {
  const [dashboard, setDashboard] = useState<AdminDashboard>(emptyDashboard);
  const [favoriteCandidates, setFavoriteCandidates] = useState<AdminDashboardEmployee[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [recentTaskStatus, setRecentTaskStatus] = useState<TaskStatus>("REVIEW_REQUESTED");
  const [recentTaskSortOrder, setRecentTaskSortOrder] = useState<AdminDashboardSortOrder | "">("");
  const [isPreRegisterOpen, setIsPreRegisterOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPreRegisterSubmitting, setIsPreRegisterSubmitting] = useState(false);
  const [isFavoriteUpdating, setIsFavoriteUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashboardResponse, favoriteCandidateResponse, memberResponse] = await Promise.all([
          getAdminDashboard(accessToken, {
            sortOrder: recentTaskSortOrder === "" ? undefined : recentTaskSortOrder,
            status: recentTaskStatus
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
  }, [accessToken, recentTaskSortOrder, recentTaskStatus]);

  const branches = useMemo(() => {
    const values = members.map((member) => member.branch).filter((branch): branch is string => !!branch);
    return Array.from(new Set(values));
  }, [members]);

  const roles = useMemo(() => {
    return Array.from(
      new Set(
        members
          .filter((member) => !selectedBranch || member.branch === selectedBranch)
          .map((member) => member.roleType)
      )
    );
  }, [members, selectedBranch]);

  const assignees = useMemo(() => {
    return members.filter((member) => {
      const isSameBranch = !selectedBranch || member.branch === selectedBranch;
      const isSameRole = !selectedRole || member.roleType === selectedRole;
      return isSameBranch && isSameRole;
    });
  }, [members, selectedBranch, selectedRole]);

  async function refreshDashboard() {
    const dashboardResponse = await getAdminDashboard(accessToken, {
      sortOrder: recentTaskSortOrder === "" ? undefined : recentTaskSortOrder,
      status: recentTaskStatus
    });
    setDashboard(dashboardResponse);
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

  async function handleDeleteFavoriteMember(memberId: number, memberName: string) {
    if (!window.confirm(`${memberName} 님을 함께 프로젝트 중에서 정말로 삭제하시겠습니까?`)) {
      return;
    }

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

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!selectedAssigneeId) {
      setMessage("담당자를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask(accessToken, {
        title,
        description,
        assigneeScope: selectedAssigneeId === ALL_ASSIGNEES_VALUE ? "ALL" : "SINGLE",
        ...(selectedAssigneeId === ALL_ASSIGNEES_VALUE
          ? {}
          : { assigneeId: Number(selectedAssigneeId) })
      });
      setTitle("");
      setDescription("");
      setSelectedAssigneeId("");
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
    setSelectedRole("");
    setSelectedAssigneeId("");
  }

  function handleRoleChange(value: string) {
    setSelectedRole(value);
    setSelectedAssigneeId("");
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
      setIsPreRegisterOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "직원 사전등록에 실패했습니다.");
    } finally {
      setIsPreRegisterSubmitting(false);
    }
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
        <DashboardHeader
          onAddMember={() => setIsPreRegisterOpen((isOpen) => !isOpen)}
          roleType={dashboard.currentMember.roleType}
        />
        <GreetingCard memberName={dashboard.currentMember.name} />
        <MessageBanner message={message} />
        {isPreRegisterOpen && (
          <MemberPreRegisterPanel
            isSubmitting={isPreRegisterSubmitting}
            onClose={() => setIsPreRegisterOpen(false)}
            onSubmit={handlePreRegister}
          />
        )}
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
          onRoleChange={handleRoleChange}
          onSubmit={handleCreateTask}
          onTitleChange={setTitle}
          roles={roles}
          selectedAssigneeId={selectedAssigneeId}
          selectedBranch={selectedBranch}
          selectedRole={selectedRole}
          title={title}
        />
        <RecentOutputsSection
          onSortOrderChange={setRecentTaskSortOrder}
          onStatusChange={setRecentTaskStatus}
          recentOutputs={dashboard.recentOutputs}
          selectedSortOrder={recentTaskSortOrder}
          selectedStatus={recentTaskStatus}
        />
        <DashboardActionSection />
        <DashboardLogout onLogout={onLogout} />
      </div>
    </main>
  );
}

export default AdminDashboardPage;
