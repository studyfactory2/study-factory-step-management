import { Bell } from "lucide-react";
import type { MemberRole } from "@/types/domain";
import { roleLabels } from "./constants";

type DashboardHeaderProps = {
  roleType: MemberRole;
};

export function DashboardHeader({ roleType }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-5">
      <h1 className="text-[28px] font-semibold tracking-normal text-[#5A3E3B]">
        관리자 대시보드 - {roleLabels[roleType]}
      </h1>
      <div className="flex items-center gap-5">
        <button className="h-11 rounded-full border-2 border-primary bg-white px-10 text-sm font-semibold text-primary">
          직원 추가
        </button>
        <button aria-label="알림" className="text-primary">
          <Bell aria-hidden className="h-9 w-9 stroke-[2.4]" />
        </button>
      </div>
    </header>
  );
}
