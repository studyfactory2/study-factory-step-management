"use client";

import { FormEvent, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Heart,
  ClipboardList,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  UserPlus,
  UserRound,
  X
} from "lucide-react";
import { login, type LoginResponse } from "@/api/auth";
import { getMemberBranches, registerMember } from "@/api/member";
import { getPositionTree, type PositionTreeNode } from "@/api/position";
import { getTaskStatusSummary, type TaskStatusSummary } from "@/api/task";
import { RoleTree } from "@/components/role-tree";
import { StatusCard } from "@/components/status-card";
import {
  clearRememberedLoginName,
  getRememberedLoginName,
  saveAuth,
  saveRememberedLoginName
} from "@/lib/auth-storage";

type StatusCardItem = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: "pink" | "lavender" | "gold" | "sage";
};

const defaultSummary: TaskStatusSummary = {
  registered: 0,
  registeredToday: 0,
  inProgress: 0,
  inProgressWeeklyChange: 0,
  reviewRequested: 0,
  reviewRequestedWeeklyChange: 0,
  completedThisMonth: 0
};

function formatWeeklyChange(change: number): string {
  if (change > 0) {
    return `지난주 대비 ${change}건 증가`;
  }

  if (change < 0) {
    return `지난주 대비 ${Math.abs(change)}건 감소`;
  }

  return "지난주와 동일";
}

function createStatusCards(summary: TaskStatusSummary): StatusCardItem[] {
  return [
    {
      label: "업무등록",
      value: String(summary.registered),
      helper: `오늘 ${summary.registeredToday}건 등록`,
      icon: ClipboardList,
      tone: "pink"
    },
    {
      label: "진행 중",
      value: String(summary.inProgress),
      helper: formatWeeklyChange(summary.inProgressWeeklyChange),
      icon: BriefcaseBusiness,
      tone: "lavender"
    },
    {
      label: "검토요청",
      value: String(summary.reviewRequested),
      helper: formatWeeklyChange(summary.reviewRequestedWeeklyChange),
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberName, setRememberName] = useState(false);
  const [positions, setPositions] = useState<PositionTreeNode[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [positionTreeMessage, setPositionTreeMessage] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskSummary, setTaskSummary] = useState<TaskStatusSummary>(defaultSummary);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    const rememberedName = getRememberedLoginName();

    if (rememberedName) {
      setName(rememberedName);
      setRememberName(true);
    }
  }, []);

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
        setPositionTreeMessage("로그인 화면 조직도를 불러오지 못했습니다.");
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

      saveAuth(response);
      if (rememberName) {
        saveRememberedLoginName(name);
      } else {
        clearRememberedLoginName();
      }
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
      </header>

      <section className="mb-5 rounded-[24px] border border-[#EBCDD1] bg-white/86 p-4 shadow-soft backdrop-blur">
        <div className="mb-4 flex items-center justify-center rounded-full bg-[#FFF1F6] px-4 py-2">
          <h2 className="text-center text-[20px] font-black tracking-normal text-[#3F2C28]">
            직위트리
          </h2>
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

        <div className="grid grid-cols-2 gap-3">
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
            <span className="text-base font-black text-[#4B332E]">이름</span>
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
                type={isPasswordVisible ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                className="text-[#BFA4A0] transition hover:text-[#F188A4]"
                onClick={() => setIsPasswordVisible((current) => !current)}
                type="button"
              >
                {isPasswordVisible ? (
                  <Eye aria-hidden className="h-5 w-5" />
                ) : (
                  <EyeOff aria-hidden className="h-5 w-5" />
                )}
              </button>
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 px-1 text-sm font-bold text-[#9C7D79]">
            <label className="flex items-center gap-2">
              <input
                checked={rememberName}
                className="h-5 w-5 rounded border-[#EBCDD1] accent-[#F188A4]"
                onChange={(event) => {
                  const isChecked = event.target.checked;
                  setRememberName(isChecked);

                  if (!isChecked) {
                    clearRememberedLoginName();
                  }
                }}
                type="checkbox"
              />
              이름 기억하기
            </label>
            <button
              className="text-[#9C7D79] transition hover:text-[#F188A4]"
              onClick={() => setIsRegisterModalOpen(true)}
              type="button"
            >
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

      {isRegisterModalOpen && (
        <MemberRegisterDialog onClose={() => setIsRegisterModalOpen(false)} />
      )}
    </main>
  );
}

function MemberRegisterDialog({ onClose }: { onClose: () => void }) {
  const [registerName, setRegisterName] = useState("");
  const [registerBranch, setRegisterBranch] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getMemberBranches()
      .then(setBranches)
      .catch(() => {
        setBranches([]);
        setMessage("지점 목록을 불러오지 못했습니다.");
      });
  }, []);

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      await registerMember({
        branch: registerBranch,
        name: registerName,
        password: registerPassword
      });
      setMessage("직원 등록이 완료되었습니다. 로그인해주세요.");
      setRegisterName("");
      setRegisterBranch("");
      setRegisterPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "직원 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F2C28]/35 px-4 py-6 backdrop-blur-sm">
      <section className="max-h-[calc(100dvh-48px)] w-full max-w-[520px] overflow-y-auto rounded-[26px] border border-[#EBCDD1] bg-[#FFFEFC] p-5 shadow-[0_18px_60px_rgba(111,74,71,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-black tracking-normal text-[#3F2C28]">직원 등록</h2>
            <p className="mt-1 text-sm font-bold text-[#9C7D79]">
              사전등록된 이름, 지점과 사용할 비밀번호를 입력해주세요.
            </p>
          </div>
          <button
            aria-label="직원 등록 닫기"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF1F6] text-[#F188A4] transition hover:brightness-95"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-5 space-y-3" onSubmit={handleRegisterSubmit}>
          <div className="relative">
            <select
              className="h-12 w-full appearance-none rounded-[16px] border border-[#EBCDD1] bg-white px-4 pr-12 text-sm font-bold text-[#8D706B] outline-none disabled:bg-[#FFF7F8] disabled:text-[#C9ABA6]"
              disabled={branches.length === 0}
              onChange={(event) => setRegisterBranch(event.target.value)}
              required
              value={registerBranch}
            >
              <option value="">지점</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B88F89]"
            />
          </div>
          <input
            className="h-12 w-full rounded-[16px] border border-[#EBCDD1] bg-white px-4 text-sm font-bold text-[#4B332E] outline-none placeholder:text-[#C9ABA6]"
            onChange={(event) => setRegisterName(event.target.value)}
            placeholder="이름"
            required
            type="text"
            value={registerName}
          />
          <input
            className="h-12 w-full rounded-[16px] border border-[#EBCDD1] bg-white px-4 text-sm font-bold text-[#4B332E] outline-none placeholder:text-[#C9ABA6]"
            inputMode="numeric"
            maxLength={4}
            minLength={4}
            onChange={(event) => setRegisterPassword(event.target.value)}
            placeholder="비밀번호 4자리"
            required
            type="password"
            value={registerPassword}
          />

          {message && (
            <p className="rounded-[16px] bg-[#FFF3F5] px-4 py-3 text-center text-sm font-black text-[#E97999]">
              {message}
            </p>
          )}

          <button
            className="flex h-12 w-full items-center justify-center rounded-[16px] bg-[#F188A4] px-4 text-base font-black text-white shadow-soft transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "등록 중" : "직원 등록"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
