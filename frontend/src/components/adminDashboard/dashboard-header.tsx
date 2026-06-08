import { Bell } from "lucide-react";
import type { MemberRole } from "@/types/domain";
import { roleLabels } from "./constants";

type DashboardHeaderProps = {
  roleType: MemberRole;
};

export function DashboardHeader({ roleType }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between rounded-[28px] border border-[#F1CFD5] bg-[#FFFEFC]/95 px-8 py-5 shadow-[0_10px_22px_rgba(239,126,158,0.12)]">
      <h1 className="text-[28px] font-black tracking-normal text-[#3F2C28]">
        관리자 대시보드 - {roleLabels[roleType]}
      </h1>
      <div className="flex items-center gap-5">
        <button aria-label="알림" className="text-primary transition hover:-translate-y-0.5">
          <Bell aria-hidden className="h-8 w-8 stroke-[2.4]" />
        </button>
      </div>
    </header>
  );
}
