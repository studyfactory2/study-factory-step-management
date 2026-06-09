"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  createTaskComment,
  getTaskCommentActivities,
  getTaskDetail,
  updateTaskDescription,
  type TaskCommentActivity,
  type TaskComment,
  type TaskDetail
} from "@/api/task";
import type { TaskStatus } from "@/types/domain";
import type { MemberRole } from "@/types/domain";
import { roleLabels } from "@/components/adminDashboard/constants";
import { formatDateTime } from "@/components/adminDashboard/utils";

type TaskDetailPageProps = {
  accessToken: string;
  currentMemberRole: MemberRole;
  onBack: () => void;
  taskId: number;
};

const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "업무등록", value: "REGISTERED" },
  { label: "진행중", value: "IN_PROGRESS" },
  { label: "검토요청", value: "REVIEW_REQUESTED" },
  { label: "완료", value: "COMPLETED" }
];

export function TaskDetailPage({ accessToken, currentMemberRole, onBack, taskId }: TaskDetailPageProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
        <header className="relative flex items-center justify-center">
          <button
            className="absolute left-0 h-11 rounded-full border border-[#F2C9C2] bg-white px-7 text-sm font-black text-[#9B7A75] shadow-sm"
            onClick={onBack}
            type="button"
          >
            ← 뒤로
          </button>
          <h1 className="text-[34px] font-black tracking-normal text-[#3F2C28]">업무상세</h1>
        </header>

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
              onTaskUpdate={setTask}
              task={task}
            />
            <InitialResultSection task={task} />
            <CommentHistorySection comments={task.comments.slice(1)} />
            <CommentSection
              accessToken={accessToken}
              onTaskUpdate={setTask}
              task={task}
            />
            <ActivitySection accessToken={accessToken} currentMemberRole={currentMemberRole} />
          </>
        )}
      </div>
    </main>
  );
}

function TaskSummarySection({ task }: { task: TaskDetail }) {
  const assigneePositionName = task.assignee.positionName ?? roleLabels[task.assignee.roleType];

  return (
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2 className="text-2xl font-black text-[#3F2C28]">{task.title}</h2>
          <p className="mt-4 text-base font-black text-[#5A3E3B]">
            담당자 {task.assignee.name} · {assigneePositionName}
          </p>
          <div className="mt-5 space-y-2 text-sm font-bold text-[#9B7A75]">
            <p>최초생성일&nbsp;&nbsp; {formatDateTime(task.createdAt)}</p>
            <p>최종수정일&nbsp;&nbsp; {formatDateTime(task.updatedAt)}</p>
          </div>
        </div>
        <span
          className={`flex h-12 min-w-[190px] items-center justify-center rounded-full border border-[#F1CFD5] px-8 text-sm font-black ${getStatusClassName(task.status)}`}
        >
          상태: {getStatusLabel(task.status)}
        </span>
      </div>
    </section>
  );
}

function ProjectContentSection({
  accessToken,
  onTaskUpdate,
  task
}: {
  accessToken: string;
  onTaskUpdate: (task: TaskDetail) => void;
  task: TaskDetail;
}) {
  const [description, setDescription] = useState(task.description);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  return (
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-black text-[#3F2C28]">프로젝트내용</h2>
      <div className="mt-5 rounded-[20px] border border-[#F2C9C2] bg-white px-6 py-6">
        {isEditing ? (
          <textarea
            className="min-h-[180px] w-full resize-none bg-transparent text-base font-bold leading-8 text-[#5A3E3B] outline-none"
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
        ) : (
          <p className="whitespace-pre-wrap text-base font-bold leading-8 text-[#5A3E3B]">
            <HighlightedDescription task={task} />
          </p>
        )}
        {task.oneLineComment && (
          <p className="mt-5 text-base font-black text-[#599BD7]">{task.oneLineComment}</p>
        )}
      </div>
      {message && (
        <p className="mt-3 text-sm font-black text-primary">{message}</p>
      )}
      <div className="mt-5 flex justify-end gap-3">
        <button className="h-11 rounded-full bg-[#FBE6EA] px-8 text-sm font-black text-primary" type="button">
          + 사진첨부
        </button>
        <button
          className="h-11 rounded-full border border-[#F2C9C2] bg-white px-8 text-sm font-black text-[#9B7A75] disabled:opacity-60"
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

function HighlightedDescription({ task }: { task: TaskDetail }) {
  if (!isDescriptionHighlightVisible(task)) {
    return <>{task.description}</>;
  }

  const start = task.descriptionHighlightStart ?? 0;
  const end = task.descriptionHighlightEnd ?? 0;

  return (
    <>
      {task.description.slice(0, start)}
      <span className="text-[#599BD7]">{task.description.slice(start, end)}</span>
      {task.description.slice(end)}
    </>
  );
}

function InitialResultSection({ task }: { task: TaskDetail }) {
  const firstComment = task.comments[0] ?? null;

  return (
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-black text-[#3F2C28]">최초 결과물</h2>
      <div className="mt-5 rounded-[20px] border border-[#F2C9C2] bg-white px-6 py-6">
        <p className="whitespace-pre-wrap text-base font-bold leading-8 text-[#5A3E3B]">
          {firstComment?.content || "업무 진행 사항 및 요청사항이 없습니다."}
        </p>
      </div>
      <div className="mt-4 min-h-14 rounded-[18px] border border-[#F2C9C2] bg-white px-6 py-4">
        <p className={`text-base font-bold leading-6 ${firstComment?.oneLineComment ? "text-[#5A3E3B]" : "text-[#BFA4A0]"}`}>
          {firstComment?.oneLineComment || "\u00A0"}
        </p>
      </div>
      {(firstComment?.attachments.length ?? 0) > 0 && (
        <>
          <p className="mt-6 text-base font-black text-primary">첨부한 사진들</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {firstComment?.attachments.map((attachment, index) => (
              <a
                className="rounded-[18px] border border-[#F2C9C2] bg-[#FFF8F6] px-4 py-4 text-center text-sm font-bold text-[#9B7A75]"
                href={attachment.imageUrl}
                key={attachment.id}
                rel="noreferrer"
                target="_blank"
              >
                <div className="flex aspect-[4/3] items-center justify-center rounded-[14px] bg-white text-3xl text-primary">
                  +
                </div>
                <p className="mt-3">{attachment.originalName ?? `사진 ${index + 1}`}</p>
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function CommentHistorySection({ comments }: { comments: TaskComment[] }) {
  if (comments.length === 0) {
    return null;
  }

  return (
    <>
      {comments.map((comment) => (
        <CommentHistoryCard comment={comment} key={comment.id} />
      ))}
    </>
  );
}

function CommentHistoryCard({ comment }: { comment: TaskComment }) {
  return (
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-black text-[#3F2C28]">코멘트</h2>
      <div className="mt-5 rounded-[20px] border border-[#F2C9C2] bg-white px-6 py-6">
        <p className="whitespace-pre-wrap text-base font-bold leading-8 text-[#5A3E3B]">
          {comment.content || "업무 진행 사항 및 요청사항이 없습니다."}
        </p>
      </div>
      <div className="mt-4 min-h-14 rounded-[18px] border border-[#F2C9C2] bg-white px-6 py-4">
        <p className={`text-base font-bold leading-6 ${comment.oneLineComment ? "text-[#5A3E3B]" : "text-[#BFA4A0]"}`}>
          {comment.oneLineComment || "\u00A0"}
        </p>
      </div>
      {comment.attachments.length > 0 && (
        <>
          <p className="mt-6 text-base font-black text-primary">첨부한 사진들</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {comment.attachments.map((attachment, attachmentIndex) => (
              <a
                className="rounded-[18px] border border-[#F2C9C2] bg-[#FFF8F6] px-4 py-4 text-center text-sm font-bold text-[#9B7A75]"
                href={attachment.imageUrl}
                key={attachment.id}
                rel="noreferrer"
                target="_blank"
              >
                <div className="flex aspect-[4/3] items-center justify-center rounded-[14px] bg-white text-3xl text-primary">
                  +
                </div>
                <p className="mt-3">{attachment.originalName ?? `사진 ${attachmentIndex + 1}`}</p>
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function CommentSection({
  accessToken,
  onTaskUpdate,
  task
}: {
  accessToken: string;
  onTaskUpdate: (task: TaskDetail) => void;
  task: TaskDetail;
}) {
  const [content, setContent] = useState("");
  const [oneLineComment, setOneLineComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(task.status);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        content,
        oneLineComment: oneLineComment.trim() || undefined,
        status: selectedStatus
      });
      const updatedTask = await getTaskDetail(accessToken, task.id);
      onTaskUpdate(updatedTask);
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
        <button className="h-11 rounded-full bg-[#FBE6EA] px-8 text-sm font-black text-primary" type="button">
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

function ActivitySection({
  accessToken,
  currentMemberRole
}: {
  accessToken: string;
  currentMemberRole: MemberRole;
}) {
  const [activities, setActivities] = useState<TaskCommentActivity[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const isEmployee = currentMemberRole === "EMPLOYEE";

  useEffect(() => {
    async function loadActivities() {
      try {
        const commentActivities = await getTaskCommentActivities(accessToken);
        setActivities(commentActivities);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "코멘트를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadActivities();
  }, [accessToken]);

  return (
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-black text-[#3F2C28]">{isEmployee ? "내 업무 코멘트" : "활동내역"}</h2>
      <p className="mt-2 text-sm font-bold text-[#9B7A75]">코멘트 한 줄 말 · 최신순</p>
      <div className="mt-5 max-h-[360px] space-y-4 overflow-y-auto pr-3">
        {isLoading && (
          <div className="rounded-[18px] border border-dashed border-[#F2C9C2] bg-white px-5 py-8 text-center text-sm font-bold text-[#BFA4A0]">
            {isEmployee ? "내 업무 코멘트를 불러오는 중입니다." : "활동내역을 불러오는 중입니다."}
          </div>
        )}
        {message && (
          <div className="rounded-[18px] border border-dashed border-[#F2C9C2] bg-white px-5 py-8 text-center text-sm font-bold text-primary">
            {message}
          </div>
        )}
        {!isLoading && !message && activities.length === 0 && (
          <div className="rounded-[18px] border border-dashed border-[#F2C9C2] bg-white px-5 py-8 text-center text-sm font-bold text-[#BFA4A0]">
            등록된 코멘트 한 줄 말이 없습니다.
          </div>
        )}
        {activities.map((comment) => (
          isEmployee ? (
            <article
              className="grid items-center gap-4 rounded-[18px] border border-[#F2C9C2] bg-white px-5 py-4 lg:grid-cols-[180px_120px_1fr_180px]"
              key={comment.id}
            >
              <p className="font-black text-[#5A3E3B]">
                {comment.creatorPositionName ?? roleLabels[comment.creatorRoleType]} {comment.creatorName}
              </p>
              <span className={`flex h-9 items-center justify-center rounded-full border border-[#F2C9C2] text-sm font-black ${getStatusClassName(comment.status)}`}>
                {getStatusLabel(comment.status)}
              </span>
              <div>
                <p className={`text-sm font-bold ${comment.oneLineComment ? "text-[#5A3E3B]" : "text-[#BFA4A0]"}`}>
                  {comment.oneLineComment || "\u00A0"}
                </p>
              </div>
              <p className="text-right text-sm font-bold text-[#BFA4A0]">{formatDateTime(comment.updatedAt)}</p>
            </article>
          ) : (
            <article
              className="grid items-center gap-4 rounded-[18px] border border-[#F2C9C2] bg-white px-5 py-4 lg:grid-cols-[180px_120px_1fr_180px]"
              key={comment.id}
            >
              <p className="font-black text-[#5A3E3B]">
                {comment.creatorPositionName ?? roleLabels[comment.creatorRoleType]} {comment.creatorName}
              </p>
              <span className={`flex h-9 items-center justify-center rounded-full border border-[#F2C9C2] text-sm font-black ${getStatusClassName(comment.status)}`}>
                {getStatusLabel(comment.status)}
              </span>
              <div>
                <p className={`text-sm font-bold ${comment.oneLineComment ? "text-[#5A3E3B]" : "text-[#BFA4A0]"}`}>
                  {comment.oneLineComment || "\u00A0"}
                </p>
              </div>
              <p className="text-right text-sm font-bold text-[#BFA4A0]">{formatDateTime(comment.updatedAt)}</p>
            </article>
          )
        ))}
      </div>
    </section>
  );
}

function getStatusLabel(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "업무 등록";
  }

  if (status === "IN_PROGRESS") {
    return "진행중";
  }

  if (status === "REVIEW_REQUESTED") {
    return "검토요청";
  }

  return "완료";
}

function getStatusClassName(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "bg-[#FBE6EA] text-primary";
  }

  if (status === "IN_PROGRESS") {
    return "bg-[#EEE8FF] text-[#8B72C8]";
  }

  if (status === "REVIEW_REQUESTED") {
    return "bg-[#FFF1D7] text-[#C88449]";
  }

  return "bg-[#E8F3DF] text-[#6D956A]";
}

function isDescriptionHighlightVisible(task: TaskDetail) {
  if (
    task.descriptionHighlightStart === null ||
    task.descriptionHighlightEnd === null ||
    !task.descriptionHighlightExpiresAt
  ) {
    return false;
  }

  return new Date(task.descriptionHighlightExpiresAt).getTime() > Date.now();
}

export default TaskDetailPage;
