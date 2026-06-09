"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type {
  AdminDashboardEmployee,
  AdminDashboardRecentOutput,
  AdminDashboardSortOrder
} from "@/api/admin";
import {
  addFavoriteMember,
  deleteFavoriteMember,
  getFavoriteMemberCandidates,
  getFavoriteMembers
} from "@/api/favorite-member";
import { getMembers } from "@/api/member";
import {
  createTask,
  getTaskRecentWorkStatus
} from "@/api/task";
import { DashboardHeader } from "@/components/adminDashboard/dashboard-header";
import { DashboardLogout } from "@/components/adminDashboard/dashboard-logout";
import { EmployeeListSection } from "@/components/adminDashboard/employee-list-section";
import { GreetingCard } from "@/components/adminDashboard/greeting-card";
import { MessageBanner } from "@/components/adminDashboard/message-banner";
import { RecentOutputsSection } from "@/components/adminDashboard/recent-outputs-section";
import { TaskCreateForm, type TaskCreateDraftSubmit } from "@/components/adminDashboard/task-create-form";
import { isAssignableMember } from "@/components/adminDashboard/utils";
import type { StoredMember } from "@/lib/auth-storage";
import type { Member, TaskStatus } from "@/types/domain";

type EmployeeDashboardPageProps = {
  accessToken: string;
  currentMember: StoredMember;
  onLogout: () => void;
  onTaskDetailOpen: (taskId: number) => void;
};

type ConfirmDialogState = {
  memberId: number;
  memberName: string;
} | null;

export function EmployeeDashboardPage({
  accessToken,
  currentMember,
  onLogout,
  onTaskDetailOpen
}: Partial<EmployeeDashboardPageProps>) {
  const [favoriteMembers, setFavoriteMembers] = useState<AdminDashboardEmployee[]>([]);
  const [favoriteCandidates, setFavoriteCandidates] = useState<AdminDashboardEmployee[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [recentOutputs, setRecentOutputs] = useState<AdminDashboardRecentOutput[]>([]);
  const [recentTaskStatuses, setRecentTaskStatuses] = useState<TaskStatus[]>(["REVIEW_REQUESTED"]);
  const [recentTaskSortOrder, setRecentTaskSortOrder] = useState<AdminDashboardSortOrder>("LATEST");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriteUpdating, setIsFavoriteUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);

  useEffect(() => {
    async function loadDashboard() {
      if (!accessToken) {
        return;
      }

      try {
        const [favorites, candidates, memberResponse, recentOutputResponse] = await Promise.all([
          getFavoriteMembers(accessToken),
          getFavoriteMemberCandidates(accessToken),
          getMembers(),
          getTaskRecentWorkStatus(accessToken, {
            sortOrder: recentTaskSortOrder,
            statuses: recentTaskStatuses
          })
        ]);

        setFavoriteMembers(favorites);
        setFavoriteCandidates(candidates);
        setMembers(memberResponse.filter(isAssignableMember));
        setRecentOutputs(recentOutputResponse);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "직원 대시보드를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [accessToken, recentTaskSortOrder, recentTaskStatuses]);

  async function refreshRecentOutputs() {
    if (!accessToken) {
      return;
    }

    const recentOutputResponse = await getTaskRecentWorkStatus(accessToken, {
      sortOrder: recentTaskSortOrder,
      statuses: recentTaskStatuses
    });
    setRecentOutputs(recentOutputResponse);
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

  async function handleCreateTask(request: TaskCreateDraftSubmit) {
    if (!accessToken) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await createTask(accessToken, {
        assigneeId: request.assigneeId,
        assigneeScope: "SINGLE",
        description: request.description,
        title: request.title
      });
      setMessage("업무가 등록되었습니다.");
      await refreshRecentOutputs();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "업무를 등록하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddFavoriteMember(memberId: number) {
    setIsFavoriteUpdating(true);
    setMessage("");

    try {
      if (!accessToken) {
        return;
      }

      const employees = await addFavoriteMember(accessToken, memberId);
      setFavoriteMembers(employees);
      setMessage("함께 프로젝트 중 직원이 추가되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "함께 프로젝트 중 직원을 추가하지 못했습니다.");
    } finally {
      setIsFavoriteUpdating(false);
    }
  }

  async function handleDeleteFavoriteMember(memberId: number) {
    setIsFavoriteUpdating(true);
    setMessage("");

    try {
      if (!accessToken) {
        return;
      }

      const employees = await deleteFavoriteMember(accessToken, memberId);
      setFavoriteMembers(employees);
      setMessage("함께 프로젝트 중 직원이 삭제되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "함께 프로젝트 중 직원을 삭제하지 못했습니다.");
    } finally {
      setIsFavoriteUpdating(false);
      setConfirmDialog(null);
    }
  }

  if (!accessToken || !currentMember || !onLogout || !onTaskDetailOpen) {
    return null;
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
          isCentered
          roleType={currentMember.roleType}
          title="내 업무현황"
        />
        <GreetingCard memberName={currentMember.name} />
        <MessageBanner message={message} />
        {isLoading ? (
          <section className="rounded-[28px] border border-[#F1CFD5] bg-[#FFFEFC]/95 p-8 text-center text-sm font-black text-[#9C7D79] shadow-[0_10px_22px_rgba(239,126,158,0.12)]">
            직원 대시보드를 불러오는 중입니다.
          </section>
        ) : (
          <EmployeeListSection
            candidates={favoriteCandidates}
            employees={favoriteMembers}
            isUpdating={isFavoriteUpdating}
            maxFavoriteCount={5}
            onAddFavoriteMember={handleAddFavoriteMember}
            onDeleteFavoriteMember={(memberId, memberName) => setConfirmDialog({ memberId, memberName })}
          />
        )}
        <TaskCreateForm
          accessToken={accessToken}
          assignees={members}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          onPublished={refreshRecentOutputs}
          onSubmit={handleCreateTask}
        />
        <RecentOutputsSection
          onDetailOpen={onTaskDetailOpen}
          onSortOrderToggle={handleRecentTaskSortToggle}
          onStatusToggle={handleRecentTaskStatusToggle}
          recentOutputs={recentOutputs}
          selectedSortOrder={recentTaskSortOrder}
          selectedStatuses={recentTaskStatuses}
        />
        <DashboardLogout onLogout={onLogout} />
      </div>

      {confirmDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#3F2C28]/35 px-4">
          <div className="w-full max-w-[420px] rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] p-7 text-center shadow-[0_18px_44px_rgba(90,62,59,0.2)]">
            <p className="text-2xl font-black text-[#3F2C28]">함께 프로젝트 중 직원 삭제</p>
            <p className="mt-3 text-sm font-bold leading-6 text-[#8F7470]">
              {confirmDialog.memberName} 님을 목록에서 삭제할까요?
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                className="h-11 rounded-full border border-[#F0B9C8] bg-white text-sm font-black text-primary"
                onClick={() => setConfirmDialog(null)}
                type="button"
              >
                취소
              </button>
              <button
                className="h-11 rounded-full bg-primary text-sm font-black text-white shadow-sm"
                onClick={() => handleDeleteFavoriteMember(confirmDialog.memberId)}
                type="button"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default EmployeeDashboardPage;
