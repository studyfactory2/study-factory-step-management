"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
  addTaskAttachments,
  updateTaskDescription,
  type TaskDetail
} from "@/api/task";
import { AttachmentImageGrid } from "./attachment-image-grid";
import { HighlightedDescription } from "./highlighted-description";

type ProjectContentSectionProps = {
  accessToken: string;
  onImagePreview: (imageUrl: string) => void;
  onTaskUpdate: (task: TaskDetail) => void;
  task: TaskDetail;
};

export function ProjectContentSection({
  accessToken,
  onTaskUpdate,
  onImagePreview,
  task
}: ProjectContentSectionProps) {
  const [description, setDescription] = useState(task.description);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDescription(task.description);
    setIsEditing(false);
  }, [task.id, task.description]);

  async function handleDescriptionEdit() {
    setMessage("");

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setIsSaving(true);

    try {
      const updatedTask = await updateTaskDescription(accessToken, task.id, description);
      onTaskUpdate(updatedTask);
      setMessage("프로젝트 내용이 수정되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "프로젝트 내용을 수정하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setMessage("");
    setIsSaving(true);

    try {
      const updatedTask = await addTaskAttachments(accessToken, task.id, files);
      onTaskUpdate(updatedTask);
      setMessage("사진이 첨부되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "사진을 첨부하지 못했습니다.");
    } finally {
      setIsSaving(false);
      event.target.value = "";
    }
  }

  return (
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-4 py-4 shadow-[0_6px_0_#EFC6BE]">
      <h2 className="text-[17px] font-black text-[#3F2C28]">프로젝트내용</h2>
      <div className="mt-3 rounded-[16px] border border-[#F2C9C2] bg-white px-4 py-4">
        {isEditing ? (
          <textarea
            className="min-h-[120px] w-full resize-none bg-transparent text-[13px] font-bold leading-5 text-[#5A3E3B] outline-none"
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
        ) : (
          <p className="whitespace-pre-wrap text-[13px] font-bold leading-5 text-[#5A3E3B]">
            <HighlightedDescription task={task} />
          </p>
        )}
      </div>
      {task.attachments.length > 0 && (
        <>
          <p className="mt-4 text-[13px] font-black text-primary">첨부한 사진들</p>
          <AttachmentImageGrid attachments={task.attachments} onImagePreview={onImagePreview} />
        </>
      )}
      {message && (
        <p className="mt-2 text-[12px] font-black text-primary">{message}</p>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          multiple
          onChange={handleAttachmentChange}
          ref={fileInputRef}
          type="file"
        />
        <button
          className="h-7 rounded-full bg-[#FBE6EA] px-3 text-[12px] font-black text-primary disabled:opacity-60"
          disabled={isSaving}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          + 사진첨부
        </button>
        <button
          className="h-7 rounded-full border border-[#F2C9C2] bg-white px-3 text-[12px] font-black text-[#9B7A75] disabled:opacity-60"
          disabled={isSaving}
          onClick={handleDescriptionEdit}
          type="button"
        >
          {isSaving ? "수정 중" : "글 수정"}
        </button>
      </div>
    </section>
  );
}
