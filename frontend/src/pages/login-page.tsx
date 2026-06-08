"use client";

import { FormEvent, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  Heart,
  ClipboardList,
  EyeOff,
  Lock,
  Sparkles,
  UserPlus,
  UserRound
} from "lucide-react";
import { login, type LoginResponse } from "@/api/auth";
import { getPositionTree, type PositionTreeNode } from "@/api/position";
import { getTaskStatusSummary, type TaskStatusSummary } from "@/api/task";
import { RoleTree } from "@/components/role-tree";
import { StatusCard } from "@/components/status-card";

type StatusCardItem = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: "pink" | "lavender" | "gold" | "sage";
};

const defaultSummary: TaskStatusSummary = {
  registered: 0,
  inProgress: 0,
  reviewRequested: 0,
  completedThisMonth: 0
};

function createStatusCards(summary: TaskStatusSummary): StatusCardItem[] {
  return [
    {
      label: "업무등록",
      value: String(summary.registered),
      helper: "현재 등록중",
      icon: ClipboardList,
      tone: "pink"
    },
    {
      label: "진행 중",
      value: String(summary.inProgress),
      helper: "현재 진행중",
      icon: BriefcaseBusiness,
      tone: "lavender"
    },
    {
      label: "검토요청",
      value: String(summary.reviewRequested),
      helper: "현재 검토요청중",
      icon: Bell,
      tone: "gold"
    },
    {
      label: "완료",
      value: String(summary.completedThisMonth),
      helper: "이번 달 완료",
      icon: CheckCircle2,
      tone: "sage"
    }
  ];
}

type LoginPageProps = {
  onLogin?: (response: LoginResponse) => void;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [rememberName, setRememberName] = useState(false);
  const [positions, setPositions] = useState<PositionTreeNode[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [positionTreeMessage, setPositionTreeMessage] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskSummary, setTaskSummary] = useState<TaskStatusSummary>(defaultSummary);

  useEffect(() => {
    getTaskStatusSummary()
      .then(setTaskSummary)
      .catch(() => setTaskSummary(defaultSummary));
  }, []);

  useEffect(() => {
    getPositionTree()
      .then((positionTree) => {
        setPositions(positionTree);
        setSelectedPositionId(positionTree[0]?.id ?? null);
        setPositionTreeMessage("");
      })
      .catch(() => {
        setPositions([]);
        setSelectedPositionId(null);
        setPositionTreeMessage("직위트리를 불러오지 못했습니다.");
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await login({
        name,
        password
      });

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("currentMember", JSON.stringify(response.member));
      setMessage(`${response.member.name}님, 로그인되었습니다.`);
      onLogin?.(response);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[920px] flex-col px-5 py-6 text-[#4B332E] lg:px-8">
      <div className="pointer-events-none fixed left-8 top-12 text-[#F0C957]">
        <Sparkles aria-hidden className="h-7 w-7 fill-current" />
      </div>
      <div className="pointer-events-none fixed right-9 top-20 text-[#F1A9C0]">
        <Sparkles aria-hidden className="h-6 w-6 fill-current" />
      </div>

      <header className="mb-7 pt-3 text-center">
        <h1 className="text-[34px] font-black leading-tight tracking-normal text-[#3F2C28]">
          자격증공장 업무전달현황
        </h1>
        <p className="mt-2 text-[17px] font-bold text-[#9C7D79]">
          이름과 비밀번호로 로그인하세요.
        </p>
      </header>

      <section className="mb-5 rounded-[24px] border border-[#EBCDD1] bg-white/86 p-4 shadow-soft backdrop-blur">
        <div className="mb-4 flex items-center gap-3 rounded-full bg-[#FFF1F6] px-4 py-2">
          <h2 className="shrink-0 text-[20px] font-black tracking-normal text-[#3F2C28]">
            직위트리
          </h2>
          <div className="min-w-0 flex-1 truncate rounded-full border border-[#EBCDD1] bg-white px-4 py-1.5 text-center text-sm font-bold text-[#9C7D79]">
            관리자페이지에서 트리 모양과 텍스트를 수정할 수 있음
          </div>
        </div>

        {positionTreeMessage ? (
          <div className="rounded-[18px] border border-dashed border-[#EBCDD1] bg-[#FFF9FA] px-4 py-8 text-center text-sm font-bold text-[#9C7D79]">
            {positionTreeMessage}
          </div>
        ) : (
          <RoleTree
            onSelectPosition={setSelectedPositionId}
            positions={positions}
            selectedPositionId={selectedPositionId}
          />
        )}
      </section>

      <section className="mb-5 rounded-[24px] border border-[#EBCDD1] bg-white/86 p-4 shadow-soft backdrop-blur">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[21px] font-black tracking-normal text-[#3F2C28]">전체업무현황</h2>
          <div className="rounded-full bg-[#FFF1C9] px-4 py-2 text-sm font-bold text-[#B18735]">
            우리 모두 잘하고 있어요!
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {createStatusCards(taskSummary).map((card) => (
            <StatusCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[24px] border border-[#EBCDD1] bg-white/90 p-3 shadow-soft backdrop-blur lg:px-6 lg:py-4">
        <div className="mb-0.5 flex justify-center text-[#F188A4]">
          <Heart aria-hidden className="h-5 w-5 fill-current" />
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-[78px_1fr] items-center gap-2.5 lg:grid-cols-[100px_1fr]">
            <span className="text-base font-black text-[#4B332E]">로그인</span>
            <label className="flex min-h-[48px] items-center gap-3 rounded-[16px] border border-[#EBCDD1] bg-white px-4 shadow-sm">
              <UserRound aria-hidden className="h-5 w-5 text-[#F188A4]" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#C9ABA6]"
                onChange={(event) => setName(event.target.value)}
                placeholder="이름을 입력하세요"
                type="text"
                value={name}
              />
            </label>
          </div>

          <div className="grid grid-cols-[78px_1fr] items-center gap-2.5 lg:grid-cols-[100px_1fr]">
            <span className="text-base font-black text-[#4B332E]">비밀번호</span>
            <label className="flex min-h-[48px] items-center gap-3 rounded-[16px] border border-[#EBCDD1] bg-white px-4 shadow-sm">
              <Lock aria-hidden className="h-5 w-5 text-[#F188A4]" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#C9ABA6]"
                maxLength={4}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="4자리"
                type="password"
                value={password}
              />
              <EyeOff aria-label="비밀번호 숨김" className="h-5 w-5 text-[#BFA4A0]" />
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 px-1 text-sm font-bold text-[#9C7D79]">
            <label className="flex items-center gap-2">
              <input
                checked={rememberName}
                className="h-5 w-5 rounded border-[#EBCDD1] accent-[#F188A4]"
                onChange={(event) => setRememberName(event.target.checked)}
                type="checkbox"
              />
              이름 기억하기
            </label>
            <button className="text-[#9C7D79] transition hover:text-[#F188A4]" type="button">
              직원등록 &gt;
            </button>
          </div>

          {message && (
            <p className="rounded-[16px] bg-[#FFF3F5] px-4 py-2.5 text-center text-sm font-black text-[#E97999]">
              {message}
            </p>
          )}

          <button
            className="flex min-h-[50px] w-full items-center justify-center rounded-[16px] bg-[#F188A4] px-4 py-2.5 text-lg font-black text-white shadow-soft transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "로그인 중" : "로그인"}
          </button>

          <button
            className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-[16px] border border-[#EBCDD1] bg-[#FFF7F8] px-4 py-2 text-sm font-black text-[#E97999] transition hover:bg-[#FFF0F2]"
            type="button"
          >
            <UserPlus aria-hidden className="h-5 w-5" />
            홈화면에 추가하기
          </button>
        </form>
      </section>

      <footer className="mt-6 flex items-center justify-center gap-3 rounded-full bg-[#FFF2F6] px-4 py-4 text-center text-[17px] font-black text-[#4B332E]">
        <Sparkles aria-hidden className="h-5 w-5 text-[#F188A4]" />
        당신은 우리 회사의 자랑스러운 인재!
      </footer>
    </main>
  );
}

export default LoginPage;
