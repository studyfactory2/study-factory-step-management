import type { ReactNode } from "react";
import { ClipboardList, MessageCircle } from "lucide-react";
import type {
  TaskComment,
  TaskDetail,
  TaskDetailAttachment
} from "@/api/task";
import { formatDateTime } from "@/components/adminDashboard/utils";
import { getStatusClassName, getStatusLabel } from "./constants";

type TaskConversationSectionProps = {
  onImagePreview: (imageUrl: string) => void;
  task: TaskDetail;
};

type ConversationTone = "assignee" | "creator";

type TimelineAuthor = {
  branch: string | null;
  id: number;
  name: string;
};

export function TaskConversationSection({
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
        const tone = comment.creator.id === task.creator.id ? "creator" : "assignee";

        return (
          <TimelineEntry
            author={comment.creator}
            card={
              <CommentBubble
                comment={comment}
                index={index + 1}
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
  const textColor = tone === "creator" ? "text-[#D93D72]" : "text-[#1572CC]";

  return (
    <aside className="w-[50px] shrink-0 text-center">
      <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF4FF] text-[20px] font-normal ${textColor}`}>
        {initial}
      </div>
      <p className={`mt-2 break-keep text-[13px] font-normal leading-4 ${textColor}`}>
        {author.name}
      </p>
      <p className="mt-1 break-keep text-[10px] font-normal leading-3 text-[#7D7471]">
        {author.branch ?? "소속 미지정"}
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
        <span className="flex h-6 items-center justify-center rounded-[7px] border border-[#F2C8D5] bg-white px-2 text-[10px] font-normal text-[#D93D72]">
          최초작성
        </span>
        <span className="min-w-0 flex-1 text-[11px] font-normal text-[#6F6662]">
          {formatDateTime(task.createdAt)}
        </span>
        <StatusBadge status={task.status} />
      </div>

      <BubbleTitle title={task.title} />
      <p className="mt-3 whitespace-pre-wrap text-[14px] font-normal leading-7 text-[#1F1A18]">
        {task.description}
      </p>
      <AttachmentPreviewGrid attachments={task.attachments} onImagePreview={onImagePreview} />
      <OneLineComment tone="creator" value={task.oneLineComment} />
    </article>
  );
}

function CommentBubble({
  comment,
  index,
  onImagePreview,
  taskTitle,
  tone
}: {
  comment: TaskComment;
  index: number;
  onImagePreview: (imageUrl: string) => void;
  taskTitle: string;
  tone: ConversationTone;
}) {
  const isCreator = tone === "creator";
  const cardClassName = isCreator
    ? "border-[#F0C5D2] bg-[#FFF3F7]"
    : "border-[#B8D8F5] bg-[#EFF8FF]";
  const indexClassName = isCreator
    ? "border-[#F2C8D5] bg-[#FFF7FA] text-[#D93D72]"
    : "border-[#66B7F4] bg-[#1687E8] text-white";

  return (
    <article className={`rounded-[18px] border px-3 py-3 shadow-sm ${cardClassName}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-6 min-w-9 items-center justify-center rounded-[7px] border px-2 text-[11px] font-normal ${indexClassName}`}>
          #{index}
        </span>
        <span className="min-w-0 flex-1 text-[11px] font-normal text-[#6F6662]">
          {formatDateTime(comment.createdAt)}
        </span>
        <StatusBadge status={comment.status} />
      </div>

      <BubbleTitle title={taskTitle} />
      <p className="mt-3 whitespace-pre-wrap text-[15px] font-normal leading-7 text-[#1F1A18]">
        {comment.content}
      </p>
      <AttachmentPreviewGrid attachments={comment.attachments} onImagePreview={onImagePreview} />
      <OneLineComment tone={tone} value={comment.oneLineComment} />
    </article>
  );
}

function BubbleTitle({ title }: { title: string }) {
  return (
    <h2 className="mt-4 flex items-start gap-2 text-[18px] font-normal leading-6 text-[#181412]">
      <ClipboardList aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#1572CC]" />
      <span className="min-w-0 break-keep">{title}</span>
    </h2>
  );
}

function StatusBadge({ status }: { status: TaskDetail["status"] }) {
  return (
    <span className={`flex h-6 shrink-0 items-center justify-center rounded-[7px] border px-2 text-[10px] font-normal ${getStatusClassName(status)}`}>
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
          className="w-[96px] shrink-0 overflow-hidden rounded-[8px] border border-[#DED6D2] bg-white p-1"
          key={attachment.id}
          onClick={() => onImagePreview(attachment.imageUrl)}
          type="button"
        >
          <img
            alt=""
            className="aspect-[3/4] w-full rounded-[6px] object-cover"
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
  const iconColor = tone === "creator" ? "text-[#D93D72]" : "text-[#1572CC]";

  return (
    <p className="mt-4 flex items-center gap-2 text-[14px] font-normal leading-5 text-[#1F1A18]">
      <MessageCircle aria-hidden className={`h-5 w-5 shrink-0 ${iconColor}`} />
      {value && <span>{value}</span>}
    </p>
  );
}
