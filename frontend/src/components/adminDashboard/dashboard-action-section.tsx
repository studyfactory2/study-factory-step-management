import type { ReactNode } from "react";
import { Bell, GitBranch, UserPlus, UsersRound, X } from "lucide-react";

export type MemberManagementView = "menu" | "preRegister";

type DashboardActionSectionProps = {
  isMemberManagementOpen: boolean;
  memberManagementView: MemberManagementView;
  memberPreRegisterPanel: ReactNode;
  onBackToMemberManagementMenu: () => void;
  onCloseMemberManagement: () => void;
  onOpenMemberManagement: () => void;
  onSelectMemberPreRegister: () => void;
  onSelectPositionTree: () => void;
};

export function DashboardActionSection({
  isMemberManagementOpen,
  memberManagementView,
  memberPreRegisterPanel,
  onBackToMemberManagementMenu,
  onCloseMemberManagement,
  onOpenMemberManagement,
  onSelectMemberPreRegister,
  onSelectPositionTree
}: DashboardActionSectionProps) {
  return (
    <section className="relative grid gap-5 md:grid-cols-2">
      <button
        className="flex min-h-[110px] items-center justify-between rounded-[24px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-6 text-left shadow-[0_8px_0_#EFC6BE]"
        onClick={onOpenMemberManagement}
        type="button"
      >
        <div>
          <p className="text-2xl font-semibold text-[#5A3E3B]">직원관리</p>
          <p className="mt-2 text-sm font-medium text-[#9B7A75]">
            사원 사전등록/삭제, 로그인 화면 트리생성 기능
          </p>
        </div>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FBE6EA] text-primary">
          <UsersRound aria-hidden className="h-7 w-7" />
        </span>
      </button>
      <button
        className="flex min-h-[110px] items-center justify-between rounded-[24px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-6 text-left shadow-[0_8px_0_#EFC6BE]"
        type="button"
      >
        <div>
          <p className="text-2xl font-semibold text-[#5A3E3B]">알림피드백</p>
          <p className="mt-2 text-sm font-medium text-[#9B7A75]">알림과 피드백 내역을 확인합니다.</p>
        </div>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEE8FF] text-[#8B72C8]">
          <Bell aria-hidden className="h-7 w-7" />
        </span>
      </button>
      {isMemberManagementOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#3F2C28]/30 px-4">
          <div className="w-full max-w-[760px] rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] p-7 shadow-[0_18px_44px_rgba(90,62,59,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-2xl font-black text-[#3F2C28]">직원관리</p>
                <p className="mt-2 text-sm font-semibold text-[#9B7A75]">
                  {memberManagementView === "menu"
                    ? "관리할 항목을 선택해주세요."
                    : "사원 사전등록 정보를 입력해주세요."}
                </p>
              </div>
              <button
                aria-label="직원관리 닫기"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBE6EA] text-primary"
                onClick={onCloseMemberManagement}
                type="button"
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>
            {memberManagementView === "menu" ? (
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <button
                  className="flex min-h-[150px] flex-col items-start justify-between rounded-[22px] border border-[#F2C9C2] bg-[#FFF8F9] p-5 text-left transition hover:-translate-y-0.5 hover:border-primary"
                  onClick={onSelectMemberPreRegister}
                  type="button"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                    <UserPlus aria-hidden className="h-6 w-6" />
                  </span>
                  <span className="text-lg font-black text-[#3F2C28]">사원 사전등록 관리</span>
                </button>
                <button
                  className="flex min-h-[150px] flex-col items-start justify-between rounded-[22px] border border-[#D9D1F3] bg-[#F7F3FF] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#8B72C8]"
                  onClick={onSelectPositionTree}
                  type="button"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#8B72C8] shadow-sm">
                    <GitBranch aria-hidden className="h-6 w-6" />
                  </span>
                  <span className="text-lg font-black text-[#3F2C28]">로그인 화면 트리 관리</span>
                </button>
              </div>
            ) : (
              <div className="mt-7">
                <button
                  className="mb-4 h-9 rounded-full border border-[#F0B9C8] bg-white px-5 text-sm font-black text-primary"
                  onClick={onBackToMemberManagementMenu}
                  type="button"
                >
                  선택지로 돌아가기
                </button>
                {memberPreRegisterPanel}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
