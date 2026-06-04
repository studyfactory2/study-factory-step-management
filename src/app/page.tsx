import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  EyeOff,
  Lock,
  Sparkles,
  UserRound
} from "lucide-react";
import { RoleTree } from "@/components/role-tree";
import { StatusCard } from "@/components/status-card";

type StatusCardItem = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: "pink" | "lavender" | "gold" | "sage";
};

const statusCards: StatusCardItem[] = [
  {
    label: "업무등록",
    value: "28",
    helper: "오늘 등록 6건",
    icon: ClipboardList,
    tone: "pink"
  },
  {
    label: "진행 중",
    value: "18",
    helper: "지난주 대비 +3",
    icon: BriefcaseBusiness,
    tone: "lavender"
  },
  {
    label: "검토요청",
    value: "7",
    helper: "확인 필요",
    icon: Bell,
    tone: "gold"
  },
  {
    label: "완료",
    value: "52",
    helper: "이번달 완료",
    icon: CheckCircle2,
    tone: "sage"
  }
];

export default function Home() {
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

          <RoleTree />

          <div className="grid grid-cols-2 gap-3">
            {statusCards.map((card) => (
              <StatusCard key={card.label} {...card} />
            ))}
          </div>
        </div>

        <form className="space-y-3 rounded-[24px] border border-dashed border-border bg-[#FFF9F8] p-4">
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
            <UserRound aria-hidden className="h-5 w-5 text-primary" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#C8AAA5]"
              placeholder="이름 또는 아이디"
              type="text"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
            <Lock aria-hidden className="h-5 w-5 text-primary" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#C8AAA5]"
              placeholder="비밀번호"
              type="password"
            />
            <EyeOff aria-label="비밀번호 숨김" className="h-5 w-5 text-muted-foreground" />
          </label>
          <button
            className="flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-base font-black text-primary-foreground shadow-soft transition hover:brightness-105"
            type="button"
          >
            로그인
          </button>
        </form>
      </section>
    </main>
  );
}
