"use client";

import type { ReactNode } from "react";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  Crown,
  Folder,
  Lock,
  Settings,
  Smartphone,
  Tag,
  ToggleLeft,
  TrafficCone,
  UserRound,
  UsersRound
} from "lucide-react";
import { ResponsiveContainer } from "@/components/layout/responsive-container";

type AdminSettingsPageProps = {
  onBack?: () => void;
  onDepartmentPositionOpen?: () => void;
  onMemberManagementOpen?: () => void;
  onOrgChartOpen?: () => void;
  onPreRegisterOpen?: () => void;
};

const managementMenus = [
  {
    action: "preRegister",
    icon: UserRound,
    label: "사원 사전등록",
    tone: "border-[#B8D8F5] bg-[#EAF3FF] text-[#2D70CB]"
  },
  {
    action: "memberManagement",
    icon: UsersRound,
    label: "사원관리",
    tone: "border-[#B8D8F5] bg-[#F4FAFF] text-[#2D70CB]"
  },
  {
    action: "departmentPosition",
    icon: Tag,
    label: "부서/직급관리",
    tone: "border-[#F0C5C5] bg-[#FFF1F1] text-[#D95858]"
  },
  {
    action: null,
    icon: Folder,
    label: "업무종류관리",
    tone: "border-[#F0DD96] bg-[#FFF9D9] text-[#C7961D]"
  },
  {
    action: null,
    icon: TrafficCone,
    label: "상태표시관리",
    tone: "border-[#D2C3F0] bg-[#F4EEFF] text-[#6F55AE]"
  },
  {
    action: null,
    icon: ClipboardList,
    label: "게시판관리",
    tone: "border-[#BFD8CE] bg-[#F0FAF5] text-[#3E8B66]"
  }
] as const;

export function AdminSettingsPage({
  onBack,
  onDepartmentPositionOpen,
  onMemberManagementOpen,
  onOrgChartOpen,
  onPreRegisterOpen
}: AdminSettingsPageProps) {
  if (!onBack) {
    return null;
  }

  return (
    <main className="login-pdf-font min-h-dvh overflow-hidden bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <ResponsiveContainer variant="settings">
        <header className="relative pb-2 pt-0.5 text-center">
          <button
            aria-label="뒤로가기"
            className="absolute left-0 top-0 flex h-7 min-w-7 items-center justify-center rounded-[9px] border border-[#D8D1CE] bg-[#F7F7F7] px-2.5 text-[13px] font-bold leading-none text-[#333333] shadow-sm sm:h-8 sm:min-w-8 sm:px-3 sm:text-[17px] md:h-9 md:min-w-9 md:text-[19px]"
            onClick={onBack}
            type="button"
          >
            ←
          </button>
          <div className="absolute right-0 top-0 inline-flex h-7 items-center gap-1 rounded-[9px] border border-[#C7CDD4] bg-[#F4FAFF] px-2.5 text-[12px] font-normal text-[#2D70CB] shadow-sm sm:h-8 sm:gap-1.5 sm:px-3 sm:text-[13px] md:h-9 md:px-3.5 md:text-[14px]">
            <Lock aria-hidden className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            관리자 전용
          </div>
          <h1 className="flex items-center justify-center gap-2 text-[26px] font-normal text-[#111111]">
            <Settings aria-hidden className="h-7 w-7 text-[#222222]" />
            설정
          </h1>
        </header>

        <section className="rounded-[16px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <h2 className="mb-3 flex items-center gap-1.5 text-[18px] font-normal text-[#222222]">
            <BriefcaseBusiness aria-hidden className="h-4.5 w-4.5 text-[#A87928]" />
            관리 메뉴
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {managementMenus.map((menu) => {
              const Icon = menu.icon;

              return (
                <button
                  className={`flex h-[52px] items-center justify-center gap-2 rounded-[12px] border text-[15px] font-normal shadow-sm ${menu.tone}`}
                  key={menu.label}
                  onClick={
                    menu.action === "preRegister"
                      ? onPreRegisterOpen
                      : menu.action === "memberManagement"
                        ? onMemberManagementOpen
                        : menu.action === "departmentPosition"
                          ? onDepartmentPositionOpen
                        : undefined
                  }
                  type="button"
                >
                  <Icon aria-hidden className="h-5 w-5 shrink-0" />
                  {menu.label}
                </button>
              );
            })}
          </div>
        </section>

        <button
          className="relative grid w-full grid-cols-[minmax(0,1fr)_24px] overflow-visible rounded-[16px] border border-[#D8D1CE] bg-white text-left shadow-[0_2px_10px_rgba(95,73,68,0.08)]"
          onClick={onOrgChartOpen}
          type="button"
        >
          <span className="absolute bottom-[-1px] left-[-1px] top-[-1px] w-2.5 rounded-l-[16px] bg-[#FFD6DC]" />
          <span className="py-4 pl-5 pr-3">
            <span className="flex items-center gap-2 text-[20px] font-normal text-[#222222]">
              <Building2 aria-hidden className="h-5 w-5 text-[#7B8B91]" />
              조직도 관리
            </span>
            <span className="mt-2 block text-[13px] font-normal text-[#7B716D]">
              조직 구조와 부서, 직급을 관리합니다
            </span>
          </span>
          <span className="flex items-center justify-center text-[30px] font-normal text-[#4F4542]">›</span>
        </button>

        <section className="relative overflow-visible rounded-[16px] border border-[#D8D1CE] bg-white shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <span className="absolute bottom-[-1px] left-[-1px] top-[-1px] w-2.5 rounded-l-[16px] bg-[#D8ECFF]" />
          <div className="py-4 pl-5 pr-3">
            <h2 className="flex items-center gap-2 text-[20px] font-normal text-[#222222]">
              <Bell aria-hidden className="h-5 w-5 text-[#E0AA2E]" />
              알림 설정
            </h2>

            <div className="mt-3 divide-y divide-dashed divide-[#D8D1CE]">
              <NotificationRole
                description="본인에게 업무가 왔을 때만 숫자로 알림"
                icon={<UserRound aria-hidden className="h-5 w-5 text-[#2D70CB]" />}
                title="직원"
              />
              <NotificationRole
                description="본인 받은 업무 알림 + 전 직원 업무 발송량만큼 알림"
                icon={<Tag aria-hidden className="h-5 w-5 text-[#2D70CB]" />}
                title="관리자"
              />
              <NotificationRole
                description="전체 업무 흐름 알림, 모든 부서와 직원 포함"
                icon={<Crown aria-hidden className="h-5 w-5 text-[#E0AA2E]" />}
                title="CEO"
              />
              <div className="flex h-12 items-center justify-between">
                <span className="flex items-center gap-2 text-[16px] font-normal text-[#222222]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F5]">
                    <Bell aria-hidden className="h-4 w-4 text-[#777777]" />
                  </span>
                  무음 모드
                </span>
                <ToggleLeft aria-hidden className="h-10 w-10 text-[#D7D7D7]" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[16px] border border-[#D8D1CE] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <h2 className="mb-2 flex items-center gap-2 text-[20px] font-normal text-[#222222]">
            <Smartphone aria-hidden className="h-5 w-5 text-[#4F6F82]" />
            앱 정보
          </h2>
          <InfoRow label="버전:" value="v1.0.0" />
          <InfoRow label="개발사:" value="수험생 연구소" />
          <InfoRow label="문의:" value="051)757-5134" />
          <div className="mt-3 flex items-center justify-center gap-4 border-t border-dashed border-[#D8D1CE] pt-3 text-[14px] font-normal text-[#6F6662]">
            <button type="button">이용약관</button>
            <span>/</span>
            <button type="button">개인정보처리방침</button>
          </div>
        </section>
      </ResponsiveContainer>
    </main>
  );
}

function NotificationRole({
  description,
  icon,
  title
}: {
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex gap-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[16px] font-normal text-[#222222]">{title}</span>
        <span className="mt-1 block text-[13px] font-normal leading-4 text-[#7B716D]">{description}</span>
      </span>
    </div>
  );
}

function InfoRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex h-8 items-center justify-between border-b border-dashed border-[#D8D1CE] text-[14px] font-normal">
      <span className="text-[#6F6662]">{label}</span>
      <span className="text-[#4F4542]">{value}</span>
    </div>
  );
}

export default AdminSettingsPage;
