"use client";

import { useEffect, useState } from "react";
import {
  deleteTask,
  deleteTaskComment,
  getTaskDetail,
  readTaskDetailCache,
  updateTaskComment,
  type TaskCommentUpdateRequest,
  type TaskDetail,
} from "@/api/task";
import { isAdminRole } from "@/lib/auth-storage";
import type { MemberRole } from "@/types/domain";
import { CommentSection } from "@/components/pages/taskDetail/comment-section";
import { ConfirmDialog } from "@/components/pages/dashboard/confirm-dialog";
import { ResponsiveContainer } from "@/components/layout/responsive-container";
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
  taskId,
}: TaskDetailPageProps) {
  const [task, setTask] = useState<TaskDetail | null>(() =>
    readTaskDetailCache(accessToken, taskId),
  );
  const [message, setMessage] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isTaskDeleteConfirmOpen, setIsTaskDeleteConfirmOpen] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [isTaskDeleteComplete, setIsTaskDeleteComplete] = useState(false);

  useEffect(() => {
    const cachedTask = readTaskDetailCache(accessToken, taskId);
    if (cachedTask) {
      setTask(cachedTask);
    }

    async function loadTaskDetail() {
      try {
        const taskDetail = await getTaskDetail(accessToken, taskId);
        setTask(taskDetail);
        setMessage("");
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "업무 상세 정보를 불러오지 못했습니다.",
        );
      }
    }

    void loadTaskDetail();
  }, [accessToken, taskId]);

  async function handleCommentDeleteConfirm() {
    if (!deleteCommentId || isDeletingComment) {
      return;
    }

    try {
      setIsDeletingComment(true);
      await deleteTaskComment(accessToken, taskId, deleteCommentId);
      const taskDetail = await getTaskDetail(accessToken, taskId);
      setTask(taskDetail);
      setDeleteCommentId(null);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "코멘트를 삭제하지 못했습니다.",
      );
    } finally {
      setIsDeletingComment(false);
    }
  }

  async function handleCommentUpdate(
    commentId: number,
    request: TaskCommentUpdateRequest,
  ) {
    try {
      await updateTaskComment(accessToken, taskId, commentId, request);
      const taskDetail = await getTaskDetail(accessToken, taskId);
      setTask(taskDetail);
      setMessage("");
    } catch (error) {
      const updateMessage =
        error instanceof Error
          ? error.message
          : "코멘트를 수정하지 못했습니다.";
      setMessage(updateMessage);
      throw error;
    }
  }

  async function handleTaskDeleteConfirm() {
    if (!task || isDeletingTask) {
      return;
    }

    try {
      setIsDeletingTask(true);
      await deleteTask(accessToken, task.id);
      setIsTaskDeleteConfirmOpen(false);
      setIsTaskDeleteComplete(true);
      setMessage("");
    } catch (error) {
      setIsTaskDeleteConfirmOpen(false);
      setMessage(
        error instanceof Error ? error.message : "업무를 삭제하지 못했습니다.",
      );
    } finally {
      setIsDeletingTask(false);
    }
  }

  const canDeleteTask = Boolean(
    task &&
      (isAdminRole(currentMemberRole) || task.creator.id === currentMemberId),
  );

  return (
    <main className="login-pdf-font relative isolate min-h-dvh overflow-hidden bg-[linear-gradient(180deg,#eaf4ff_0%,#f4f1ff_38%,#f7f8fa_76%)] px-3 py-4 text-[#222222]">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(49,130,246,0.26)_0%,rgba(49,130,246,0)_70%)] blur-md"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 top-44 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(124,92,255,0.2)_0%,rgba(124,92,255,0)_70%)] blur-lg"
      />
      <ResponsiveContainer className="relative z-10 space-y-4" variant="detail">
        <TaskDetailHeader
          canDelete={canDeleteTask}
          onBack={onBack}
          onDelete={() => setIsTaskDeleteConfirmOpen(true)}
          title={task?.title}
        />

        {message && (
          <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-4 py-7 text-center shadow-[0_6px_0_#EFC6BE]">
            <p className="text-[15px] font-black text-primary">{message}</p>
          </section>
        )}

        {task && (
          <>
            <TaskConversationSection
              currentMemberId={currentMemberId}
              currentMemberRole={currentMemberRole}
              onCommentDelete={setDeleteCommentId}
              onCommentUpdate={handleCommentUpdate}
              onImagePreview={setPreviewImageUrl}
              task={task}
            />
            <CommentSection
              accessToken={accessToken}
              currentMemberId={currentMemberId}
              currentMemberRole={currentMemberRole}
              onTaskUpdate={setTask}
              task={task}
            />
          </>
        )}
      </ResponsiveContainer>

      {previewImageUrl && (
        <ImagePreviewDialog
          imageUrl={previewImageUrl}
          onClose={() => setPreviewImageUrl(null)}
        />
      )}
      {deleteCommentId ? (
        <ConfirmDialog
          confirmLabel={isDeletingComment ? "삭제 중" : "삭제"}
          description="삭제하면 이 업무에서 코멘트를 다시 볼 수 없습니다."
          onCancel={() => setDeleteCommentId(null)}
          onConfirm={() => void handleCommentDeleteConfirm()}
          title="코멘트를 삭제할까요?"
        />
      ) : null}
      {isTaskDeleteConfirmOpen && task ? (
        <ConfirmDialog
          confirmLabel={isDeletingTask ? "삭제 중" : "삭제"}
          description="삭제하면 업무와 모든 코멘트 및 알림을 다시 확인할 수 없습니다."
          onCancel={() => setIsTaskDeleteConfirmOpen(false)}
          onConfirm={() => void handleTaskDeleteConfirm()}
          title={`‘${task.title}’ 업무를 삭제할까요?`}
        />
      ) : null}
      {isTaskDeleteComplete ? (
        <ConfirmDialog
          cancelLabel={null}
          confirmLabel="확인"
          description="업무 목록으로 이동합니다."
          onCancel={onBack}
          onConfirm={onBack}
          title="업무 삭제가 완료되었습니다."
        />
      ) : null}
    </main>
  );
}

export default TaskDetailPage;
