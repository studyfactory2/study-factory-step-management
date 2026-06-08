"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getTaskDetail, type TaskDetail } from "@/api/task";
import type { TaskStatus } from "@/types/domain";
import { roleLabels } from "@/components/adminDashboard/constants";
import { formatDateTime } from "@/components/adminDashboard/utils";

type TaskDetailPageProps = {
  accessToken: string;
  onBack: () => void;
  taskId: number;
};

const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "업무등록", value: "REGISTERED" },
  { label: "진행중", value: "IN_PROGRESS" },
  { label: "검토요청", value: "REVIEW_REQUESTED" },
  { label: "완료", value: "COMPLETED" }
];

export function TaskDetailPage({ accessToken, onBack, taskId }: TaskDetailPageProps) {
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
            <ProjectContentSection task={task} />
            <InitialResultSection task={task} />
            <FeedbackSection task={task} />
            <ActivitySection task={task} />
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

function ProjectContentSection({ task }: { task: TaskDetail }) {
  return (
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-black text-[#3F2C28]">프로젝트내용</h2>
      <div className="mt-5 rounded-[20px] border border-[#F2C9C2] bg-white px-6 py-6">
        <p className="whitespace-pre-wrap text-base font-bold leading-8 text-[#5A3E3B]">{task.description}</p>
        {task.oneLineComment && (
          <p className="mt-5 text-base font-black text-[#599BD7]">{task.oneLineComment}</p>
        )}
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <button className="h-11 rounded-full bg-[#FBE6EA] px-8 text-sm font-black text-primary" type="button">
          + 사진첨부
        </button>
        <button className="h-11 rounded-full border border-[#F2C9C2] bg-white px-8 text-sm font-black text-[#9B7A75]" type="button">
          글 수정
        </button>
      </div>
    </section>
  );
}

function InitialResultSection({ task }: { task: TaskDetail }) {
  return (
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-black text-[#3F2C28]">최초 결과물</h2>
      <div className="mt-5 rounded-[20px] border border-[#F2C9C2] bg-white px-6 py-6">
        {task.oneLineComment ? (
          <p className="text-base font-bold leading-8 text-[#5A3E3B]">{task.oneLineComment}</p>
        ) : (
          <p className="text-base font-bold leading-8 text-[#9B7A75]">등록된 한줄멘트가 없습니다.</p>
        )}
      </div>
      <p className="mt-6 text-base font-black text-primary">첨부한 사진들</p>
      {task.attachments.length === 0 ? (
        <div className="mt-4 rounded-[18px] border border-dashed border-[#F2C9C2] bg-[#FFF8F6] px-6 py-8 text-center text-sm font-bold text-[#9B7A75]">
          첨부된 사진이 없습니다.
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {task.attachments.map((attachment, index) => (
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
      )}
    </section>
  );
}

function FeedbackSection({ task }: { task: TaskDetail }) {
  return (
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <div className="flex items-center justify-between gap-5">
        <h2 className="text-2xl font-black text-[#3F2C28]">피드백 남기기</h2>
        <button className="h-11 rounded-full bg-[#FBE6EA] px-8 text-sm font-black text-primary" type="button">
          사진첨부
        </button>
      </div>
      <textarea
        className="mt-5 h-32 w-full resize-none rounded-[20px] border border-[#F2C9C2] bg-white px-6 py-5 text-base font-bold outline-none placeholder:text-[#BFA4A0]"
        placeholder="피드백을 남겨주세요"
      />
      <input
        className="mt-4 h-14 w-full rounded-[18px] border border-[#F2C9C2] bg-white px-6 text-base font-bold outline-none placeholder:text-[#BFA4A0]"
        placeholder="간단 한 줄 말 쓰는 칸"
      />
      <div className="mt-5 grid gap-3 lg:grid-cols-[90px_1fr]">
        <span className="flex h-11 items-center text-base font-black text-[#5A3E3B]">상태변경</span>
        <div className="grid gap-3 sm:grid-cols-4">
          {statusOptions.map((option) => (
            <button
              className={`h-11 rounded-full border border-[#F2C9C2] text-sm font-black ${
                task.status === option.value
                  ? getStatusClassName(option.value)
                  : "bg-white text-[#BFA4A0]"
              }`}
              key={option.value}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <button className="min-h-[52px] rounded-full bg-primary text-base font-black text-white" type="button">
          피드백 등록
        </button>
        <button className="min-h-[52px] rounded-full border border-[#F2C9C2] bg-white text-base font-black text-[#9B7A75]" type="button">
          수정
        </button>
      </div>
      <button className="mt-4 h-12 w-full rounded-full border border-[#F2C9C2] bg-[#FFF8F6] text-base font-black text-primary" type="button">
        + 피드백 추가하기
      </button>
    </section>
  );
}

function ActivitySection({ task }: { task: TaskDetail }) {
  const assigneePositionName = task.assignee.positionName ?? roleLabels[task.assignee.roleType];

  return (
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-black text-[#3F2C28]">활동내역</h2>
      <p className="mt-2 text-sm font-bold text-[#9B7A75]">상태와 한줄말 · 최신순</p>
      <div className="mt-5 space-y-4">
        <article className="grid items-center gap-4 rounded-[18px] border border-[#F2C9C2] bg-white px-5 py-4 lg:grid-cols-[180px_140px_1fr_180px]">
          <p className="font-black text-[#5A3E3B]">{assigneePositionName} {task.assignee.name}</p>
          <span className={`flex h-9 items-center justify-center rounded-full border border-[#F2C9C2] text-sm font-black ${getStatusClassName(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
          <p className="text-sm font-bold text-[#5A3E3B]">{task.oneLineComment ?? "업무 내용을 확인했습니다."}</p>
          <p className="text-right text-sm font-bold text-[#BFA4A0]">{formatDateTime(task.updatedAt)}</p>
        </article>
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

export default TaskDetailPage;
