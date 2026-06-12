"use client";

import { useEffect, useState } from "react";
import { createTask } from "@/api/task";
import { getMembers } from "@/api/member";
import { TaskCreateForm, type TaskCreateDraftSubmit } from "@/components/adminDashboard/task-create-form";
import { isAssignableMember } from "@/components/adminDashboard/utils";
import { MessageBanner } from "@/components/adminDashboard/message-banner";
import type { Member } from "@/types/domain";

type TaskCreatePageProps = {
  accessToken: string;
  onBack: () => void;
  onCreated: () => void;
};

export function TaskCreatePage({
  accessToken,
  onBack,
  onCreated
}: TaskCreatePageProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadMembers() {
      try {
        const memberResponse = await getMembers();
        setMembers(memberResponse.filter(isAssignableMember));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "직원 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadMembers();
  }, []);

  async function handleCreateTask(request: TaskCreateDraftSubmit) {
    setMessage("");
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
      onCreated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "업무를 등록하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-pdf-font min-h-dvh overflow-hidden bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <div className="relative mx-auto w-full max-w-[360px] space-y-3">
        <header className="flex items-center gap-4 border-b border-[#DCE8F5] pb-3">
          <button
            className="h-7 shrink-0 bg-transparent px-0 text-[12px] font-normal text-[#111111]"
            onClick={onBack}
            type="button"
          >
            ← 뒤로
          </button>
          <h1 className="min-w-0 flex-1 truncate text-left text-[18px] font-normal tracking-normal text-[#1F1A18]">
            새 업무 등록
          </h1>
        </header>

        <MessageBanner message={message} />
        <TaskCreateForm
          accessToken={accessToken}
          assignees={members}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          onPublished={async () => onCreated()}
          onSubmit={handleCreateTask}
        />
      </div>
    </main>
  );
}

export default TaskCreatePage;
