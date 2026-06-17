"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { createTask } from "@/api/task";
import { getMembers } from "@/api/member";
import {
  TaskCreateForm,
  type TaskCreateAlert,
  type TaskCreateDraftSubmit
} from "@/components/adminDashboard/task-create-form";
import { isAssignableMember } from "@/components/adminDashboard/utils";
import { ResponsiveContainer } from "@/components/layout/responsive-container";
import { ConfirmDialog } from "@/components/pages/dashboard/confirm-dialog";
import type { Member } from "@/types/domain";

type TaskCreatePageProps = {
  accessToken: string;
  onBack: () => void;
  onCreated: () => void;
};

export function TaskCreatePage({
  accessToken,
  onBack
}: TaskCreatePageProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [alertDialog, setAlertDialog] = useState<TaskCreateAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  useEffect(() => {
    async function loadMembers() {
      try {
        const memberResponse = await getMembers();
        setMembers(memberResponse.filter(isAssignableMember));
      } catch (error) {
        setAlertDialog({
          description: error instanceof Error ? error.message : "직원 목록을 불러오지 못했습니다.",
          title: "직원 목록 오류"
        });
      } finally {
        setIsLoading(false);
      }
    }

    void loadMembers();
  }, []);

  async function handleCreateTask(request: TaskCreateDraftSubmit) {
    setIsSubmitting(true);

    try {
      await createTask(accessToken, {
        assigneeId: request.assigneeId,
        assigneeScope: "SINGLE",
        attachments: request.attachments,
        category: request.category,
        description: request.description,
        oneLineComment: request.oneLineComment,
        title: request.title
      });
      setIsSuccessDialogOpen(true);
    } catch (error) {
      setAlertDialog({
        description: error instanceof Error ? error.message : "업무를 등록하지 못했습니다.",
        title: "업무 등록 실패"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSuccessConfirm() {
    setIsSuccessDialogOpen(false);
  }

  return (
    <main className="login-pdf-font min-h-dvh overflow-hidden bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <ResponsiveContainer variant="form">
        <header className="relative border-b border-[#DCE8F5] pb-3 text-center">
          <button
            className="absolute left-0 top-0 flex h-8 w-8 shrink-0 items-center justify-center bg-transparent text-[18px] font-bold leading-none text-[#111111] sm:h-9 sm:w-9 sm:text-[22px] md:h-10 md:w-10 md:text-[24px]"
            onClick={onBack}
            aria-label="뒤로가기"
            type="button"
          >
            ←
          </button>
          <h1 className="flex items-center justify-center gap-1.5 text-[20px] font-normal tracking-normal text-[#1F1A18]">
            <Pencil aria-hidden className="h-4 w-4 opacity-0" />
            새 업무 등록
            <Pencil aria-hidden className="h-4 w-4 -translate-y-0.5 text-[#1F1A18]" />
          </h1>
          <p className="mt-2 text-center text-[15px] font-normal text-[#7B716D] drop-shadow-[0_2px_1px_rgba(95,73,68,0.24)]">
            오늘도 화이팅!
          </p>
        </header>

        <TaskCreateForm
          accessToken={accessToken}
          assignees={members}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          onAlert={setAlertDialog}
          onPublished={async () => setIsSuccessDialogOpen(true)}
          onSubmit={handleCreateTask}
        />
      </ResponsiveContainer>
      {isSuccessDialogOpen && (
        <ConfirmDialog
          cancelLabel={null}
          confirmLabel="확인"
          description="업무가 성공적으로 등록되었습니다."
          onCancel={handleSuccessConfirm}
          onConfirm={handleSuccessConfirm}
          title="업무 등록 완료"
        />
      )}
      {alertDialog && (
        <ConfirmDialog
          cancelLabel={null}
          confirmLabel="확인"
          description={alertDialog.description}
          onCancel={() => setAlertDialog(null)}
          onConfirm={() => setAlertDialog(null)}
          title={alertDialog.title}
        />
      )}
    </main>
  );
}

export default TaskCreatePage;
