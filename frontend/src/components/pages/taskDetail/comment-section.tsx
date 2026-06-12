"use client";

import { useEffect, useRef, useState } from "react";
import { Clipboard, Lock, MessageCircle, Paperclip } from "lucide-react";
import {
  createTaskComment,
  getTaskDetail,
  type TaskDetail
} from "@/api/task";
import type { MemberRole, TaskStatus } from "@/types/domain";
import { getStatusClassName, statusOptions } from "./constants";

type CommentSectionProps = {
  accessToken: string;
  currentMemberRole: MemberRole;
  onTaskUpdate: (task: TaskDetail) => void;
  task: TaskDetail;
};

const MAX_COMMENT_LENGTH = 500;

export function CommentSection({
  accessToken,
  currentMemberRole,
  onTaskUpdate,
  task
}: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [oneLineComment, setOneLineComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(task.status);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nextCommentNumber = task.comments.length + 1;
  const canCompleteTask = currentMemberRole === "ADMIN" || currentMemberRole === "CEO";

  useEffect(() => {
    setSelectedStatus(task.status);
  }, [task.status]);

  useEffect(() => {
    if (selectedStatus === "COMPLETED" && !canCompleteTask) {
      setSelectedStatus(task.status === "COMPLETED" ? "REVIEW_REQUESTED" : task.status);
    }
  }, [canCompleteTask, selectedStatus, task.status]);

  async function handleCopyTitle() {
    try {
      await navigator.clipboard.writeText(task.title);
      setMessage("업무 제목을 복사했습니다.");
    } catch {
      setMessage("내용을 복사하지 못했습니다.");
    }
  }

  async function handleCommentSubmit() {
    setMessage("");

    if (!content.trim()) {
      setMessage("코멘트 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createTaskComment(accessToken, task.id, {
        attachments,
        content,
        oneLineComment: oneLineComment.trim() || undefined,
        status: selectedStatus
      });
      const updatedTask = await getTaskDetail(accessToken, task.id);
      onTaskUpdate(updatedTask);
      setAttachments([]);
      setContent("");
      setOneLineComment("");
      setMessage("코멘트가 등록되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "코멘트를 등록하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[18px] border-2 border-[#1687E8] bg-[#FFFEFC] px-3 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 min-w-10 items-center justify-center rounded-[8px] bg-[#1687E8] px-2 text-[13px] font-normal text-white">
          #{nextCommentNumber}
        </span>
        <span className="min-w-0 flex-1 text-[11px] font-normal text-[#6F6662]">작성중</span>
        <button
          className="flex h-8 shrink-0 items-center gap-1 rounded-[8px] border border-[#D6D6D6] bg-white px-2 text-[10px] font-normal text-[#333333]"
          onClick={handleCopyTitle}
          type="button"
        >
          <Clipboard aria-hidden className="h-3.5 w-3.5" />
          내용복사하기
        </button>
      </div>

      <div className="mt-4 flex h-10 items-center gap-2 rounded-[8px] border border-[#D6D6D6] bg-white px-3">
        <span className="min-w-0 flex-1 truncate text-[14px] font-normal text-[#1F1A18]">
          {task.title}
        </span>
        <Lock aria-hidden className="h-4 w-4 shrink-0 text-[#7D7471]" />
      </div>

      <div className="relative mt-3">
        <textarea
          className="h-[128px] w-full resize-none rounded-[8px] border border-[#D6D6D6] bg-white px-3 py-3 pb-7 text-[13px] font-normal leading-6 text-[#1F1A18] outline-none placeholder:text-[#8B8582] [font-family:'Apple_SD_Gothic_Neo',system-ui,sans-serif]"
          maxLength={MAX_COMMENT_LENGTH}
          onChange={(event) => setContent(event.target.value)}
          placeholder={"댓글 내용을 입력하세요.\n자유롭게 내용을 작성할 수 있어요"}
          value={content}
        />
        <span className="absolute bottom-2 right-3 text-[11px] font-normal text-[#6F6662]">
          {content.length}/{MAX_COMMENT_LENGTH}
        </span>
      </div>

      <div className="mt-3 flex h-10 items-center gap-2 rounded-[8px] border border-[#D6D6D6] bg-white px-3">
        <MessageCircle aria-hidden className="h-4 w-4 shrink-0 text-[#8B8582]" />
        <input
          className="min-w-0 flex-1 bg-transparent text-[13px] font-normal text-[#1F1A18] outline-none placeholder:text-[#8B8582]"
          onChange={(event) => setOneLineComment(event.target.value)}
          placeholder="한줄 멘트를 남겨주세요."
          value={oneLineComment}
        />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {statusOptions.map((option) => {
          const isCompleted = option.value === "COMPLETED";
          const isDisabled = isCompleted && !canCompleteTask;

          return (
            <button
              className={`h-8 rounded-[8px] border px-1 text-[10px] font-normal ${
                selectedStatus === option.value
                  ? getStatusClassName(option.value)
                  : "border-[#D6D6D6] bg-white text-[#4F4542]"
              } ${isDisabled ? "cursor-not-allowed opacity-45" : ""}`}
              disabled={isDisabled}
              key={option.value}
              onClick={() => setSelectedStatus(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          multiple
          onChange={(event) => setAttachments(Array.from(event.target.files ?? []))}
          ref={fileInputRef}
          type="file"
        />
        <button
          className="flex h-9 items-center gap-1.5 rounded-[8px] border border-[#D6D6D6] bg-white px-3 text-[12px] font-normal text-[#333333]"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <Paperclip aria-hidden className="h-4 w-4" />
          사진첨부
        </button>
        <button
          className="flex h-9 items-center justify-center rounded-[8px] bg-[#1687E8] px-4 text-[12px] font-normal text-white disabled:opacity-60"
          disabled={isSubmitting}
          onClick={handleCommentSubmit}
          type="button"
        >
          {isSubmitting ? "등록 중" : "코멘트 등록"}
        </button>
      </div>

      {attachments.length > 0 && (
        <div className="mt-3 rounded-[10px] border border-[#D6D6D6] bg-white px-3 py-3">
          <p className="text-[10px] font-normal text-[#333333]">선택한 사진 {attachments.length}장</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {attachments.map((attachment) => (
              <span
                className="rounded-full bg-[#F4F7FA] px-3 py-1.5 text-[9px] font-normal text-[#4F4542]"
                key={`${attachment.name}-${attachment.lastModified}`}
              >
                {attachment.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {message && (
        <p className="mt-3 text-[10px] font-normal text-[#D83A42]">{message}</p>
      )}
    </section>
  );
}
