import type { ReactNode } from "react";
import { ClipboardList, MessageCircle, Trash2 } from "lucide-react";
import type {
  TaskComment,
  TaskDetail,
  TaskDetailAttachment
} from "@/api/task";
import { formatDateTime } from "@/components/adminDashboard/utils";
import type { MemberRole } from "@/types/domain";
import { getStatusClassName, getStatusLabel } from "./constants";

type TaskConversationSectionProps = {
  currentMemberId: number;
  currentMemberRole: MemberRole;
  onCommentDelete: (commentId: number) => void;
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
  onImagePreview,
  task
}: TaskConversationSectionProps) {
  return (
    <section className="space-y-6">
      <TimelineEntry
        author={task.creator}
        card={
          <InitialTaskBubble onImagePreview={onImagePreview} task={task} />
        }
        tone="creator"
      />

      {task.comments.map((comment, index) => {
        const tone = getConversationTone(task, comment);

        return (
          <TimelineEntry
            author={comment.creator}
            card={
              <CommentBubble
                canDelete={comment.creator.id === currentMemberId || isAdminRole(currentMemberRole)}
                comment={comment}
                index={index + 1}
                onDelete={onCommentDelete}
                onImagePreview={onImagePreview}
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
  tone
}: {
  author: TimelineAuthor;
  card: ReactNode;
  tone: ConversationTone;
}) {
  const isAssignee = tone === "assignee";

  return (
    <div className={`flex items-start gap-2 ${isAssignee ? "flex-row-reverse" : ""}`}>
      <AuthorBadge author={author} tone={tone} />
      <div className="min-w-0 flex-1">{card}</div>
    </div>
  );
}

function AuthorBadge({
  author,
  tone
}: {
  author: TimelineAuthor;
  tone: ConversationTone;
}) {
  const initial = author.name.trim().charAt(0) || "?";
  const toneClassName = getToneClassName(tone);

  return (
    <aside className="w-[50px] shrink-0 text-center">
      <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-[22px] font-normal ${toneClassName.avatar}`}>
        {initial}
      </div>
      <p className={`mt-2 break-keep text-[15px] font-normal leading-4 ${toneClassName.text}`}>
        {author.name}
      </p>
      <p className="mt-1 break-keep text-[12px] font-normal leading-3 text-[#7D7471]">
        {author.organizationName ?? "소속 미지정"}
      </p>
    </aside>
  );
}

function InitialTaskBubble({
  onImagePreview,
  task
}: {
  onImagePreview: (imageUrl: string) => void;
  task: TaskDetail;
}) {
  return (
    <article className="rounded-[18px] border border-[#F0C5D2] bg-[#FFF3F7] px-3 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-6 items-center justify-center rounded-[7px] border border-[#F2C8D5] bg-white px-2 text-[12px] font-normal text-[#D93D72]">
          최초작성
        </span>
        <span className="min-w-0 flex-1 text-[13px] font-normal text-[#6F6662]">
          {formatDateTime(task.createdAt)}
        </span>
        <StatusBadge status={task.status} />
      </div>

      <BubbleTitle title={task.title} />
      <p className="mt-3 whitespace-pre-wrap text-[16px] font-normal leading-7 text-[#1F1A18] [font-family:'Apple_SD_Gothic_Neo',system-ui,sans-serif]">
        {task.description}
      </p>
      <AttachmentPreviewGrid attachments={task.attachments} onImagePreview={onImagePreview} />
      <OneLineComment tone="creator" value={task.oneLineComment} />
    </article>
  );
}

function CommentBubble({
  canDelete,
  comment,
  index,
  onDelete,
  onImagePreview,
  taskTitle,
  tone
}: {
  canDelete: boolean;
  comment: TaskComment;
  index: number;
  onDelete: (commentId: number) => void;
  onImagePreview: (imageUrl: string) => void;
  taskTitle: string;
  tone: ConversationTone;
}) {
  const toneClassName = getToneClassName(tone);

  return (
    <article className={`relative rounded-[18px] border px-3 py-3 shadow-sm ${toneClassName.card}`}>
      {canDelete ? (
        <button
          aria-label="코멘트 삭제"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#D8D1CE] bg-white text-[#4F4542] shadow-sm"
          onClick={() => onDelete(comment.id)}
          type="button"
        >
          <Trash2 aria-hidden className="h-3.5 w-3.5" />
        </button>
      ) : null}
      <div className={`flex items-center gap-2 ${canDelete ? "pr-8" : ""}`}>
        <span className={`flex h-6 min-w-9 items-center justify-center rounded-[7px] border px-2 text-[13px] font-normal ${toneClassName.index}`}>
          #{index}
        </span>
        <span className="min-w-0 flex-1 text-[13px] font-normal text-[#6F6662]">
          {formatDateTime(comment.createdAt)}
        </span>
        <StatusBadge status={comment.status} />
      </div>

      <BubbleTitle title={taskTitle} />
      <p className="mt-3 whitespace-pre-wrap text-[16px] font-normal leading-7 text-[#1F1A18] [font-family:'Apple_SD_Gothic_Neo',system-ui,sans-serif]">
        {comment.content}
      </p>
      <AttachmentPreviewGrid attachments={comment.attachments} onImagePreview={onImagePreview} />
      <OneLineComment tone={tone} value={comment.oneLineComment} />
    </article>
  );
}

function BubbleTitle({ title }: { title: string }) {
  return (
    <h2 className="mt-4 flex items-start gap-2 text-[20px] font-normal leading-6 text-[#181412]">
      <ClipboardList aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#111111]" />
      <span className="min-w-0 break-keep">{title}</span>
    </h2>
  );
}

function StatusBadge({ status }: { status: TaskDetail["status"] }) {
  return (
    <span className={`flex h-6 shrink-0 items-center justify-center rounded-[7px] border px-2 text-[12px] font-normal ${getStatusClassName(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
}

function AttachmentPreviewGrid({
  attachments,
  onImagePreview
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
  value
}: {
  tone: ConversationTone;
  value: string | null;
}) {
  const iconColor = getToneClassName(tone).text;

  return (
    <p className="mt-4 flex items-center gap-2 text-[16px] font-normal leading-5 text-[#1F1A18]">
      <MessageCircle aria-hidden className={`h-5 w-5 shrink-0 ${iconColor}`} />
      {value && <span>{value}</span>}
    </p>
  );
}

function getConversationTone(task: TaskDetail, comment: TaskComment): ConversationTone {
  if (comment.creator.id === task.creator.id) {
    return "creator";
  }

  if (comment.creator.id === task.assignee.id) {
    return "assignee";
  }

  if (comment.creator.roleType === "ADMIN" || comment.creator.roleType === "CEO") {
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
      avatar: "bg-[#FFF3F7] text-[#D93D72]",
      card: "border-[#F0C5D2] bg-[#FFF3F7]",
      index: "border-[#F2C8D5] bg-[#FFF7FA] text-[#D93D72]",
      text: "text-[#D93D72]"
    };
  }

  if (tone === "admin") {
    return {
      avatar: "bg-[#F4F0FF] text-[#8B5CF6]",
      card: "border-[#CDBDFF] bg-[#F7F3FF]",
      index: "border-[#BFA7FF] bg-[#8B5CF6] text-white",
      text: "text-[#8B5CF6]"
    };
  }

  return {
    avatar: "bg-[#EAF4FF] text-[#1572CC]",
    card: "border-[#B8D8F5] bg-[#EFF8FF]",
    index: "border-[#66B7F4] bg-[#1687E8] text-white",
    text: "text-[#1572CC]"
  };
}
