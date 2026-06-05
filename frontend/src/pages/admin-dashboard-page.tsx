"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getAdminDashboard, type AdminDashboard } from "@/api/admin";
import { getMembers } from "@/api/member";
import { createTask } from "@/api/task";
import type { Member } from "@/types/domain";
import { BranchStaffSection } from "@/components/adminDashboard/branch-staff-section";
import { DashboardHeader } from "@/components/adminDashboard/dashboard-header";
import { DashboardLogout } from "@/components/adminDashboard/dashboard-logout";
import { EmployeeListSection } from "@/components/adminDashboard/employee-list-section";
import { GreetingCard } from "@/components/adminDashboard/greeting-card";
import { MessageBanner } from "@/components/adminDashboard/message-banner";
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
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashboardResponse, memberResponse] = await Promise.all([
          getAdminDashboard(accessToken),
          getMembers()
        ]);

        setDashboard(dashboardResponse);
        setMembers(memberResponse.filter(isAssignableMember));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "대시보드를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [accessToken]);

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
    const dashboardResponse = await getAdminDashboard(accessToken);
    setDashboard(dashboardResponse);
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

  return (
    <main className="min-h-dvh overflow-hidden bg-background px-4 py-7 text-foreground sm:px-8">
      <div className="pointer-events-none fixed -left-32 -top-28 h-[28rem] w-[28rem] rounded-full bg-[#FDE5EB]" />
      <div className="pointer-events-none fixed -right-28 bottom-36 h-[26rem] w-[26rem] rounded-full bg-[#EFE8FF]" />

      <div className="relative mx-auto w-full max-w-[1180px] space-y-10">
        <DashboardHeader roleType={dashboard.currentMember.roleType} />
        <GreetingCard memberName={dashboard.currentMember.name} />
        <MessageBanner message={message} />
        <EmployeeListSection employees={dashboard.employees} />
        <BranchStaffSection branchGroups={dashboard.branchGroups} />
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
        <RecentOutputsSection recentOutputs={dashboard.recentOutputs} />
        <DashboardLogout onLogout={onLogout} />
      </div>
    </main>
  );
}

export default AdminDashboardPage;
