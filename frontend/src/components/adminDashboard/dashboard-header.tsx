import { Bell } from "lucide-react";
import type { MemberRole } from "@/types/domain";
import { roleLabels } from "./constants";

type DashboardHeaderProps = {
  roleType: MemberRole;
  isCentered?: boolean;
  title?: string;
};

export function DashboardHeader({ isCentered = false, roleType, title }: DashboardHeaderProps) {
  return (
    <header className={`flex items-center rounded-[22px] border border-[#F1CFD5] bg-[#FFFEFC]/95 px-4 py-2.5 shadow-[0_10px_22px_rgba(239,126,158,0.12)] ${
      isCentered ? "justify-center" : "justify-between"
    }`}>
      <h1 className="text-[17px] font-black tracking-normal text-[#3F2C28]">
        {title ?? `관리자 대시보드 - ${roleLabels[roleType]}`}
      </h1>
      {!isCentered && (
        <div className="flex items-center gap-3">
          <button aria-label="알림" className="text-primary transition hover:-translate-y-0.5">
            <Bell aria-hidden className="h-5 w-5 stroke-[2.4]" />
          </button>
        </div>
      )}
    </header>
  );
}
