import type { ReactNode } from "react";
import { GitBranch, UserPlus, X } from "lucide-react";
import { cn } from "@/util/utils";

export type MemberManagementView = "menu" | "preRegister" | "positionTree";

type DashboardActionSectionProps = {
  isMemberManagementOpen: boolean;
  memberManagementView: MemberManagementView;
  memberPreRegisterPanel: ReactNode;
  positionTreeManagementPanel: ReactNode;
  onCloseMemberManagement: () => void;
  onSelectMemberPreRegister: () => void;
  onSelectPositionTree: () => void;
};

export function DashboardActionSection({
  isMemberManagementOpen,
  memberManagementView,
  memberPreRegisterPanel,
  positionTreeManagementPanel,
  onCloseMemberManagement,
  onSelectMemberPreRegister,
  onSelectPositionTree
}: DashboardActionSectionProps) {
  if (!isMemberManagementOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#3F2C28]/30 px-3 py-5">
      <div
        className={cn(
          "flex max-h-[calc(100dvh-40px)] w-full flex-col rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] p-4 shadow-[0_18px_44px_rgba(90,62,59,0.18)]",
          "max-w-[390px]"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[20px] font-black text-[#3F2C28]">직원관리</p>
            <p className="mt-1 text-[13px] font-semibold text-[#9B7A75]">
              {memberManagementView === "menu" && "관리할 항목을 선택해주세요."}
              {memberManagementView === "preRegister" && "사원 사전등록 정보를 입력해주세요."}
              {memberManagementView === "positionTree" && "로그인 화면 조직도를 관리해주세요."}
            </p>
          </div>
          <button
            aria-label="직원관리 닫기"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FBE6EA] text-primary"
            onClick={onCloseMemberManagement}
            type="button"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
        {memberManagementView === "menu" ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className="flex min-h-[84px] flex-col items-start justify-between rounded-[16px] border border-[#F2C9C2] bg-[#FFF8F9] p-3 text-left transition hover:-translate-y-0.5 hover:border-primary"
              onClick={onSelectMemberPreRegister}
              type="button"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <UserPlus aria-hidden className="h-4 w-4" />
              </span>
              <span className="text-[13px] font-black leading-4 text-[#3F2C28]">사원 사전등록 관리</span>
            </button>
            <button
              className="flex min-h-[84px] flex-col items-start justify-between rounded-[16px] border border-[#D9D1F3] bg-[#F7F3FF] p-3 text-left transition hover:-translate-y-0.5 hover:border-[#8B72C8]"
              onClick={onSelectPositionTree}
              type="button"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#8B72C8] shadow-sm">
                <GitBranch aria-hidden className="h-4 w-4" />
              </span>
              <span className="text-[13px] font-black leading-4 text-[#3F2C28]">로그인 화면 직위트리 관리</span>
            </button>
          </div>
        ) : memberManagementView === "preRegister" ? (
          <div className="mt-4 overflow-y-auto pr-1">
            {memberPreRegisterPanel}
          </div>
        ) : (
          <div className="mt-4 min-h-0 overflow-y-auto pr-1">
            {positionTreeManagementPanel}
          </div>
        )}
      </div>
    </div>
  );
}
