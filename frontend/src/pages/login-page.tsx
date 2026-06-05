"use client";

import { FormEvent, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  EyeOff,
  Lock,
  Sparkles,
  UserPlus,
  UserRound
} from "lucide-react";
import { login } from "@/api/auth";
import { getTaskStatusSummary, type TaskStatusSummary } from "@/api/task";
import { RoleTree } from "@/components/role-tree";
import { StatusCard } from "@/components/status-card";
import type { MemberRole } from "@/types/domain";

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

export function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<MemberRole>("ADMIN");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskSummary, setTaskSummary] = useState<TaskStatusSummary>(defaultSummary);

  useEffect(() => {
    getTaskStatusSummary()
      .then(setTaskSummary)
      .catch(() => setTaskSummary(defaultSummary));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await login({
        name,
        memberRole: selectedRole,
        password
      });

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("currentMember", JSON.stringify(response.member));
      setMessage(`${response.member.name}님, 로그인되었습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-5 py-6">
      <section className="flex flex-1 flex-col justify-between gap-6 rounded-[28px] border border-border bg-white/82 p-5 shadow-soft backdrop-blur">
        <div className="space-y-6">
          <header className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted text-primary">
              <Sparkles aria-hidden className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">자격증공장</p>
              <h1 className="text-4xl font-black leading-tight tracking-normal text-foreground">
                사원업무현황
              </h1>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                직위를 선택하고 로그인하세요
              </p>
            </div>
          </header>

          <RoleTree selectedRole={selectedRole} onSelectRole={setSelectedRole} />

          <div className="grid grid-cols-2 gap-3">
            {createStatusCards(taskSummary).map((card) => (
              <StatusCard key={card.label} {...card} />
            ))}
          </div>
        </div>

        <form
          className="space-y-3 rounded-[24px] border border-dashed border-border bg-[#FFF9F8] p-4"
          onSubmit={handleSubmit}
        >
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
            <UserRound aria-hidden className="h-5 w-5 text-primary" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#C8AAA5]"
              onChange={(event) => setName(event.target.value)}
              placeholder="이름"
              type="text"
              value={name}
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
            <Lock aria-hidden className="h-5 w-5 text-primary" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#C8AAA5]"
              maxLength={4}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호"
              type="password"
              value={password}
            />
            <EyeOff aria-label="비밀번호 숨김" className="h-5 w-5 text-muted-foreground" />
          </label>
          {message && (
            <p className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-bold text-primary">
              {message}
            </p>
          )}
          <button
            className="flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-base font-black text-primary-foreground shadow-soft transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "로그인 중" : "로그인"}
          </button>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-white px-4 py-3 text-base font-black text-primary transition hover:bg-muted"
            type="button"
          >
            <UserPlus aria-hidden className="h-5 w-5" />
            직원 등록
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
