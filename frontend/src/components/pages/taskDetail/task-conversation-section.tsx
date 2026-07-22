import { useState, type ReactNode } from "react";
import {
  Check,
  ClipboardList,
  MessageCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import type {
  TaskComment,
  TaskCommentUpdateRequest,
  TaskDetail,
  TaskDetailAttachment,
} from "@/api/task";
import { formatDateTime } from "@/components/adminDashboard/utils";
import type { MemberRole } from "@/types/domain";
import { getStatusClassName, getStatusLabel, statusOptions } from "./constants";

type TaskConversationSectionProps = {
  currentMemberId: number;
  currentMemberRole: MemberRole;
  onCommentDelete: (commentId: number) => void;
  onCommentUpdate: (
    commentId: number,
    request: TaskCommentUpdateRequest,
  ) => Promise<void>;
  onImagePreview: (imageUrl: string) => void;
  task: TaskDetail;
};

type ConversationTone = "admin" | "assignee" | "creator";

type TimelineAuthor = {
  branch: string | null;
  id: number;
  name: string;
  organizationName: string | null;
  roleType: MemberRole;
};

export function TaskConversationSection({
  currentMemberId,
  currentMemberRole,
  onCommentDelete,
  onCommentUpdate,
  onImagePreview,
  task,
}: TaskConversationSectionProps) {
  return (
    <section className="space-y-6">
      <TimelineEntry
        author={task.creator}
        card={<InitialTaskBubble onImagePreview={onImagePreview} task={task} />}
        tone="creator"
      />

      {task.comments.map((comment, index) => {
        const tone = getConversationTone(task, comment);

        return (
          <TimelineEntry
            author={comment.creator}
            card={
              <CommentBubble
                canComplete={isAdminRole(currentMemberRole)}
                canDelete={
                  comment.creator.id === currentMemberId ||
                  isAdminRole(currentMemberRole)
                }
                canEdit={
                  comment.creator.id === currentMemberId ||
                  isAdminRole(currentMemberRole)
                }
                comment={comment}
                index={index + 1}
                onDelete={onCommentDelete}
                onImagePreview={onImagePreview}
                onUpdate={onCommentUpdate}
                taskTitle={task.title}
                tone={tone}
              />
            }
            key={comment.id}
            tone={tone}
          />
        );
      })}
    </section>
  );
}

function TimelineEntry({
  author,
  card,
  tone,
}: {
  author: TimelineAuthor;
  card: ReactNode;
  tone: ConversationTone;
}) {
  const isAssignee = tone === "assignee";

  return (
    <div
      className={`flex items-start gap-2 ${isAssignee ? "flex-row-reverse" : ""}`}
    >
      <AuthorBadge author={author} tone={tone} />
      <div className="min-w-0 flex-1">{card}</div>
    </div>
  );
}

function AuthorBadge({
  author,
  tone,
}: {
  author: TimelineAuthor;
  tone: ConversationTone;
}) {
  const initial = author.name.trim().charAt(0) || "?";
  const toneClassName = getToneClassName(tone);

  return (
    <aside className="w-[72px] shrink-0 text-center">
      <div
        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] text-[20px] font-bold shadow-sm ${toneClassName.avatar}`}
      >
        {initial}
      </div>
      <p
        className={`mt-2 break-keep text-[15px] font-normal leading-4 ${toneClassName.text}`}
      >
        {author.name}
      </p>
      <p className="mt-1 whitespace-nowrap text-[10px] font-medium leading-4 tracking-[-0.05em] text-[#7D7471]">
        {author.organizationName ?? "소속 미지정"}
      </p>
    </aside>
  );
}

function InitialTaskBubble({
  onImagePreview,
  task,
}: {
  onImagePreview: (imageUrl: string) => void;
  task: TaskDetail;
}) {
  return (
    <article className="rounded-[18px] border border-[#cbd5ff] bg-[linear-gradient(145deg,#ffffff_0%,#f1f4ff_58%,#f4efff_100%)] px-3 py-3 shadow-[0_8px_20px_rgba(75,92,190,0.09)]">
      <div className="flex items-center gap-2">
        <span className="flex h-6 items-center justify-center rounded-[7px] border border-[#cbd5ff] bg-white/80 px-2 text-[12px] font-semibold text-[#5b5ce2]">
          최초작성
        </span>
        <span className="min-w-0 flex-1 text-[13px] font-normal text-[#6F6662]">
          {formatDateTime(task.createdAt)}
        </span>
        <StatusBadge status={task.status} />
      </div>

      <BubbleTitle title={task.title} />
      <p className="mt-3 whitespace-pre-wrap text-[14px] font-normal leading-6 text-[#1F1A18] [font-family:'Apple_SD_Gothic_Neo',system-ui,sans-serif]">
        {task.description}
      </p>
      <AttachmentPreviewGrid
        attachments={task.attachments}
        onImagePreview={onImagePreview}
      />
      <OneLineComment tone="creator" value={task.oneLineComment} />
    </article>
  );
}

function CommentBubble({
  canComplete,
  canDelete,
  canEdit,
  comment,
  index,
  onDelete,
  onImagePreview,
  onUpdate,
  taskTitle,
  tone,
}: {
  canComplete: boolean;
  canDelete: boolean;
  canEdit: boolean;
  comment: TaskComment;
  index: number;
  onDelete: (commentId: number) => void;
  onImagePreview: (imageUrl: string) => void;
  onUpdate: (
    commentId: number,
    request: TaskCommentUpdateRequest,
  ) => Promise<void>;
  taskTitle: string;
  tone: ConversationTone;
}) {
  const toneClassName = getToneClassName(tone);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editOneLineComment, setEditOneLineComment] = useState(
    comment.oneLineComment ?? "",
  );
  const [editStatus, setEditStatus] = useState(comment.status);
  const [isSaving, setIsSaving] = useState(false);

  function handleEditStart() {
    setEditContent(comment.content);
    setEditOneLineComment(comment.oneLineComment ?? "");
    setEditStatus(comment.status);
    setIsEditing(true);
  }

  async function handleEditSave() {
    if (!editContent.trim() || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      await onUpdate(comment.id, {
        content: editContent.trim(),
        oneLineComment: editOneLineComment.trim() || undefined,
        status: editStatus,
      });
      setIsEditing(false);
    } catch {
      // 상위 화면의 오류 메시지를 유지하고 수정 폼은 닫지 않습니다.
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article
      className={`relative rounded-[18px] border px-3 py-3 shadow-sm ${toneClassName.card}`}
    >
      <div className="flex w-full items-center gap-2">
        <span
          className={`flex h-6 min-w-9 items-center justify-center rounded-[7px] border px-2 text-[13px] font-semibold ${toneClassName.index}`}
        >
          #{index}
        </span>
        <span className="text-[13px] font-medium text-[#6b7684]">
          {formatDateTime(comment.createdAt)}
        </span>
        <span className="ml-auto shrink-0">
          <StatusBadge status={comment.status} />
        </span>
      </div>

      <BubbleTitle title={taskTitle} />
      {(canEdit || canDelete) && !isEditing ? (
        <div className="mt-2 flex h-7 items-center justify-end gap-1">
          {canEdit ? (
            <button
              aria-label="코멘트 수정"
              className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#d6dce8] bg-white/90 text-[#4e5968] shadow-sm"
              onClick={handleEditStart}
              type="button"
            >
              <Pencil aria-hidden className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {canDelete ? (
            <button
              aria-label="코멘트 삭제"
              className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#d6dce8] bg-white/90 text-[#4e5968] shadow-sm"
              onClick={() => onDelete(comment.id)}
              type="button"
            >
              <Trash2 aria-hidden className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      ) : null}

      {isEditing ? (
        <div className="mt-3 space-y-2.5">
          <textarea
            className="min-h-28 w-full resize-none rounded-[12px] border border-[#cfd8e6] bg-white/90 px-3 py-2.5 text-[15px] leading-6 text-[#191f28] outline-none focus:border-primary"
            maxLength={500}
            onChange={(event) => setEditContent(event.target.value)}
            value={editContent}
          />
          <div className="flex h-10 items-center gap-2 rounded-[12px] border border-[#cfd8e6] bg-white/90 px-3">
            <MessageCircle
              aria-hidden
              className="h-4 w-4 shrink-0 text-[#8b95a1]"
            />
            <input
              className="min-w-0 flex-1 bg-transparent text-[14px] text-[#191f28] outline-none"
              onChange={(event) => setEditOneLineComment(event.target.value)}
              placeholder="한줄 멘트"
              value={editOneLineComment}
            />
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {statusOptions.map((option) => {
              const isDisabled = option.value === "COMPLETED" && !canComplete;

              return (
                <button
                  className={`h-8 rounded-[8px] border px-1 text-[11px] font-medium ${
                    editStatus === option.value
                      ? getStatusClassName(option.value)
                      : "border-[#d6dce8] bg-white/90 text-[#4e5968]"
                  } ${isDisabled ? "cursor-not-allowed opacity-45" : ""}`}
                  disabled={isDisabled}
                  key={option.value}
                  onClick={() => setEditStatus(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="flex h-9 items-center gap-1 rounded-[10px] bg-white/90 px-3 text-[13px] font-semibold text-[#4e5968]"
              onClick={() => setIsEditing(false)}
              type="button"
            >
              <X aria-hidden className="h-4 w-4" />
              취소
            </button>
            <button
              className="flex h-9 items-center gap-1 rounded-[10px] bg-[linear-gradient(135deg,#3182f6,#6b5cff)] px-3 text-[13px] font-semibold text-white disabled:opacity-50"
              disabled={!editContent.trim() || isSaving}
              onClick={() => void handleEditSave()}
              type="button"
            >
              <Check aria-hidden className="h-4 w-4" />
              {isSaving ? "저장 중" : "저장"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 whitespace-pre-wrap text-[14px] font-normal leading-6 text-[#1F1A18] [font-family:'Apple_SD_Gothic_Neo',system-ui,sans-serif]">
            {comment.content}
          </p>
          <AttachmentPreviewGrid
            attachments={comment.attachments}
            onImagePreview={onImagePreview}
          />
          <OneLineComment tone={tone} value={comment.oneLineComment} />
        </>
      )}
    </article>
  );
}

function BubbleTitle({ title }: { title: string }) {
  return (
    <h2 className="mt-2 flex items-start gap-1.5 text-[16px] font-semibold leading-5 tracking-[-0.025em] text-[#191f28] sm:text-[17px]">
      <ClipboardList
        aria-hidden
        className="mt-0.5 h-4 w-4 shrink-0 text-[#4e5968]"
      />
      <span className="min-w-0 break-keep">{title}</span>
    </h2>
  );
}

function StatusBadge({ status }: { status: TaskDetail["status"] }) {
  return (
    <span
      className={`flex h-5 shrink-0 items-center justify-center rounded-[7px] border px-1.5 text-[10px] font-semibold ${getStatusClassName(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function AttachmentPreviewGrid({
  attachments,
  onImagePreview,
}: {
  attachments: Array<Pick<TaskDetailAttachment, "id" | "imageUrl">>;
  onImagePreview: (imageUrl: string) => void;
}) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      {attachments.map((attachment) => (
        <button
          className="w-[76px] shrink-0 overflow-hidden rounded-[8px] border border-[#DED6D2] bg-white p-1"
          key={attachment.id}
          onClick={() => onImagePreview(attachment.imageUrl)}
          type="button"
        >
          <img
            alt=""
            className="aspect-square w-full rounded-[6px] object-cover"
            src={attachment.imageUrl}
          />
        </button>
      ))}
    </div>
  );
}

function OneLineComment({
  tone,
  value,
}: {
  tone: ConversationTone;
  value: string | null;
}) {
  const iconColor = getToneClassName(tone).text;

  return (
    <p className="mt-3 flex items-center gap-1.5 text-[14px] font-normal leading-5 text-[#1F1A18]">
      <MessageCircle aria-hidden className={`h-4 w-4 shrink-0 ${iconColor}`} />
      {value && <span>{value}</span>}
    </p>
  );
}

function getConversationTone(
  task: TaskDetail,
  comment: TaskComment,
): ConversationTone {
  if (comment.creator.id === task.creator.id) {
    return "creator";
  }

  if (comment.creator.id === task.assignee.id) {
    return "assignee";
  }

  if (
    comment.creator.roleType === "ADMIN" ||
    comment.creator.roleType === "CEO"
  ) {
    return "admin";
  }

  return "assignee";
}

function isAdminRole(role: MemberRole): boolean {
  return role === "ADMIN" || role === "CEO";
}

function getToneClassName(tone: ConversationTone) {
  if (tone === "creator") {
    return {
      avatar: "bg-[linear-gradient(135deg,#edf6ff,#e8e1ff)] text-[#5b5ce2]",
      card: "border-[#cbd5ff] bg-[linear-gradient(145deg,#ffffff,#f1f4ff_58%,#f4efff)]",
      index: "border-[#cbd5ff] bg-[#f3f2ff] text-[#5b5ce2]",
      text: "text-[#5b5ce2]",
    };
  }

  if (tone === "admin") {
    return {
      avatar: "bg-[linear-gradient(135deg,#faf8ff,#e8ddff)] text-[#8B5CF6]",
      card: "border-[#CDBDFF] bg-[linear-gradient(145deg,#ffffff,#f4efff)]",
      index: "border-[#BFA7FF] bg-[#8B5CF6] text-white",
      text: "text-[#8B5CF6]",
    };
  }

  return {
    avatar: "bg-[linear-gradient(135deg,#eef8ff,#e1e7ff)] text-[#3567d4]",
    card: "border-[#bfd4f7] bg-[linear-gradient(145deg,#ffffff,#edf6ff_58%,#eef0ff)]",
    index:
      "border-[#6aaaf3] bg-[linear-gradient(135deg,#3b8ff5,#6172e8)] text-white",
    text: "text-[#3567d4]",
  };
}
