"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  getTaskDetail,
  type TaskDetail
} from "@/api/task";
import type { MemberRole } from "@/types/domain";
import { ActivitySection } from "@/components/pages/taskDetail/activity-section";
import { CommentSection } from "@/components/pages/taskDetail/comment-section";
import { ImagePreviewDialog } from "@/components/pages/taskDetail/image-preview-dialog";
import { InitialResultSection, CommentHistorySection } from "@/components/pages/taskDetail/result-sections";
import { ProjectContentSection } from "@/components/pages/taskDetail/project-content-section";
import { TaskDetailHeader } from "@/components/pages/taskDetail/task-detail-header";
import { TaskSummarySection } from "@/components/pages/taskDetail/task-summary-section";

type TaskDetailPageProps = {
  accessToken: string;
  currentMemberRole: MemberRole;
  onBack: () => void;
  onHelpRequestOpen: () => void;
  taskId: number;
};

export function TaskDetailPage({
  accessToken,
  currentMemberRole,
  onBack,
  onHelpRequestOpen,
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
    <main className="min-h-dvh overflow-hidden bg-background px-4 py-8 text-foreground sm:px-8">
      <div className="pointer-events-none fixed left-10 top-20 text-[#F0C957]">
        <Sparkles aria-hidden className="h-9 w-9 fill-current" />
      </div>
      <div className="pointer-events-none fixed right-12 top-28 text-[#F1A9C0]">
        <Sparkles aria-hidden className="h-8 w-8 fill-current" />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] space-y-7">
        <TaskDetailHeader onBack={onBack} onHelpRequestOpen={onHelpRequestOpen} />

        {isLoading && (
          <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-16 text-center shadow-[0_8px_0_#EFC6BE]">
            <p className="text-lg font-black text-[#5A3E3B]">업무 상세를 불러오는 중입니다.</p>
          </section>
        )}

        {message && (
          <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-12 text-center shadow-[0_8px_0_#EFC6BE]">
            <p className="text-lg font-black text-primary">{message}</p>
          </section>
        )}

        {task && (
          <>
            <TaskSummarySection task={task} />
            <ProjectContentSection
              accessToken={accessToken}
              onImagePreview={setPreviewImageUrl}
              onTaskUpdate={setTask}
              task={task}
            />
            <InitialResultSection onImagePreview={setPreviewImageUrl} task={task} />
            <CommentHistorySection comments={task.comments.slice(1)} onImagePreview={setPreviewImageUrl} />
            <CommentSection
              accessToken={accessToken}
              onTaskUpdate={setTask}
              task={task}
            />
            <ActivitySection accessToken={accessToken} currentMemberRole={currentMemberRole} />
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
