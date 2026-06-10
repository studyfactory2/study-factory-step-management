"use client";

import { useEffect, useRef, useState } from "react";
import {
  createTaskComment,
  getTaskDetail,
  type TaskDetail
} from "@/api/task";
import type { TaskStatus } from "@/types/domain";
import { getStatusClassName, statusOptions } from "./constants";

type CommentSectionProps = {
  accessToken: string;
  onTaskUpdate: (task: TaskDetail) => void;
  task: TaskDetail;
};

export function CommentSection({ accessToken, onTaskUpdate, task }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [oneLineComment, setOneLineComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(task.status);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSelectedStatus(task.status);
  }, [task.status]);

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
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <div className="flex items-center justify-between gap-5">
        <h2 className="text-2xl font-black text-[#3F2C28]">코멘트 남기기</h2>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          multiple
          onChange={(event) => setAttachments(Array.from(event.target.files ?? []))}
          ref={fileInputRef}
          type="file"
        />
        <button
          className="h-11 rounded-full bg-[#FBE6EA] px-8 text-sm font-black text-primary"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          사진첨부
        </button>
      </div>
      <textarea
        className="mt-5 h-32 w-full resize-none rounded-[20px] border border-[#F2C9C2] bg-white px-6 py-5 text-base font-bold outline-none placeholder:text-[#BFA4A0]"
        onChange={(event) => setContent(event.target.value)}
        placeholder="코멘트를 남겨주세요"
        value={content}
      />
      <input
        className="mt-4 h-14 w-full rounded-[18px] border border-[#F2C9C2] bg-white px-6 text-base font-bold outline-none placeholder:text-[#BFA4A0]"
        onChange={(event) => setOneLineComment(event.target.value)}
        placeholder="간단 한 줄 말 쓰는 칸"
        value={oneLineComment}
      />
      {attachments.length > 0 && (
        <div className="mt-4 rounded-[18px] border border-[#F2C9C2] bg-white px-6 py-4">
          <p className="text-sm font-black text-[#3F2C28]">선택한 사진 {attachments.length}장</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <span
                className="rounded-full bg-[#FFF8F6] px-4 py-2 text-xs font-bold text-[#9B7A75]"
                key={`${attachment.name}-${attachment.lastModified}`}
              >
                {attachment.name}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="mt-5 grid gap-3 lg:grid-cols-[90px_1fr]">
        <span className="flex h-11 items-center text-base font-black text-[#5A3E3B]">상태변경</span>
        <div className="grid gap-3 sm:grid-cols-4">
          {statusOptions.map((option) => (
            <button
              className={`h-11 rounded-full border border-[#F2C9C2] text-sm font-black ${
                selectedStatus === option.value
                  ? getStatusClassName(option.value)
                  : "bg-white text-[#BFA4A0]"
              }`}
              key={option.value}
              onClick={() => setSelectedStatus(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {message && (
        <p className="mt-4 text-sm font-black text-primary">{message}</p>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <button
          className="min-h-[52px] rounded-full bg-primary text-base font-black text-white disabled:opacity-60"
          disabled={isSubmitting}
          onClick={handleCommentSubmit}
          type="button"
        >
          {isSubmitting ? "등록 중" : "코멘트 등록"}
        </button>
        <button className="min-h-[52px] rounded-full border border-[#F2C9C2] bg-white text-base font-black text-[#9B7A75]" type="button">
          수정
        </button>
      </div>
    </section>
  );
}
