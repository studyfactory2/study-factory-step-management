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
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-4 py-4 shadow-[0_6px_0_#EFC6BE]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-black text-[#3F2C28]">코멘트 남기기</h2>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          multiple
          onChange={(event) => setAttachments(Array.from(event.target.files ?? []))}
          ref={fileInputRef}
          type="file"
        />
        <button
          className="h-7 rounded-full bg-[#FBE6EA] px-3 text-[10px] font-black text-primary"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          사진첨부
        </button>
      </div>
      <textarea
        className="mt-3 h-24 w-full resize-none rounded-[16px] border border-[#F2C9C2] bg-white px-4 py-3 text-[11px] font-bold leading-5 outline-none placeholder:text-[#BFA4A0]"
        onChange={(event) => setContent(event.target.value)}
        placeholder="코멘트를 남겨주세요"
        value={content}
      />
      <input
        className="mt-3 h-10 w-full rounded-[14px] border border-[#F2C9C2] bg-white px-4 text-[11px] font-bold outline-none placeholder:text-[#BFA4A0]"
        onChange={(event) => setOneLineComment(event.target.value)}
        placeholder="간단 한 줄 말 쓰는 칸"
        value={oneLineComment}
      />
      {attachments.length > 0 && (
        <div className="mt-3 rounded-[14px] border border-[#F2C9C2] bg-white px-4 py-3">
          <p className="text-[10px] font-black text-[#3F2C28]">선택한 사진 {attachments.length}장</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {attachments.map((attachment) => (
              <span
                className="rounded-full bg-[#FFF8F6] px-3 py-1.5 text-[9px] font-bold text-[#9B7A75]"
                key={`${attachment.name}-${attachment.lastModified}`}
              >
                {attachment.name}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="mt-3 grid gap-1.5">
        <span className="flex h-6 items-center text-[11px] font-black text-[#5A3E3B]">상태변경</span>
        <div className="grid grid-cols-4 gap-1">
          {statusOptions.map((option) => (
            <button
              className={`h-7 rounded-full border border-[#F2C9C2] px-0.5 text-[8px] font-black ${
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
        <p className="mt-3 text-[10px] font-black text-primary">{message}</p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          className="h-8 rounded-full bg-primary text-[11px] font-black text-white disabled:opacity-60"
          disabled={isSubmitting}
          onClick={handleCommentSubmit}
          type="button"
        >
          {isSubmitting ? "등록 중" : "코멘트 등록"}
        </button>
        <button className="h-8 rounded-full border border-[#F2C9C2] bg-white text-[11px] font-black text-[#9B7A75]" type="button">
          수정
        </button>
      </div>
    </section>
  );
}
