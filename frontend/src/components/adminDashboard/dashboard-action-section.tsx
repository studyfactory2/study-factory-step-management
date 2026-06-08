import { Bell, UsersRound } from "lucide-react";

export function DashboardActionSection() {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      <button
        className="flex min-h-[110px] items-center justify-between rounded-[24px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-6 text-left shadow-[0_8px_0_#EFC6BE]"
        type="button"
      >
        <div>
          <p className="text-2xl font-semibold text-[#5A3E3B]">직원관리</p>
          <p className="mt-2 text-sm font-medium text-[#9B7A75]">직원 정보와 표시 구성을 관리합니다.</p>
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
    </section>
  );
}
