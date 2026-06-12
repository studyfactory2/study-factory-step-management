"use client";

import { useEffect, useState } from "react";
import {
  getTaskDetail,
  type TaskDetail
} from "@/api/task";
import type { MemberRole } from "@/types/domain";
import { CommentSection } from "@/components/pages/taskDetail/comment-section";
import { ImagePreviewDialog } from "@/components/pages/taskDetail/image-preview-dialog";
import { TaskConversationSection } from "@/components/pages/taskDetail/task-conversation-section";
import { TaskDetailHeader } from "@/components/pages/taskDetail/task-detail-header";

type TaskDetailPageProps = {
  accessToken: string;
  currentMemberId: number;
  currentMemberRole: MemberRole;
  onBack: () => void;
  taskId: number;
};

export function TaskDetailPage({
  accessToken,
  currentMemberId,
  currentMemberRole,
  onBack,
  taskId
}: TaskDetailPageProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadTaskDetail() {
      try {
        const taskDetail = await getTaskDetail(accessToken, taskId);
        setTask(taskDetail);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "업무 상세 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadTaskDetail();
  }, [accessToken, taskId]);

  return (
    <main className="login-pdf-font min-h-dvh overflow-hidden bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <div className="relative mx-auto w-full max-w-[360px] space-y-3">
        <TaskDetailHeader onBack={onBack} title={task?.title} />

        {isLoading && (
          <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-4 py-8 text-center shadow-[0_6px_0_#EFC6BE]">
            <p className="text-[13px] font-black text-[#5A3E3B]">업무 상세를 불러오는 중입니다.</p>
          </section>
        )}

        {message && (
          <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-4 py-7 text-center shadow-[0_6px_0_#EFC6BE]">
            <p className="text-[13px] font-black text-primary">{message}</p>
          </section>
        )}

        {task && (
          <>
            <TaskConversationSection onImagePreview={setPreviewImageUrl} task={task} />
            <CommentSection
              accessToken={accessToken}
              currentMemberId={currentMemberId}
              currentMemberRole={currentMemberRole}
              onTaskUpdate={setTask}
              task={task}
            />
          </>
        )}
      </div>

      {previewImageUrl && (
        <ImagePreviewDialog imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
      )}
    </main>
  );
}

export default TaskDetailPage;
