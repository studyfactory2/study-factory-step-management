import { Bell, ClipboardList, Newspaper } from "lucide-react";
import { type AdminDashboard } from "@/api/admin";
import { type TaskCategorySummaryItem } from "@/api/task";
import { roleLabels } from "@/components/adminDashboard/constants";

const categoryLabels = {
  DEVELOPMENT: "개발관련",
  OPERATION: "운영관련",
  MEMBER: "회원관련",
  ORDER: "주문관련"
} as const;

const categoryColorClassNames = {
  DEVELOPMENT: "text-[#2D70CB]",
  OPERATION: "text-[#E30613]",
  MEMBER: "text-[#8B72C8]",
  ORDER: "text-[#D0A112]"
} as const;

export function InProgressCategorySection({
  categorySummary,
  onBoardOpen
}: {
  categorySummary: TaskCategorySummaryItem[];
  onBoardOpen: () => void;
}) {
  const summaryMap = new Map(categorySummary.map((item) => [item.category, item.count]));

  return (
    <section className="rounded-[18px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[16px] font-normal text-[#222222]">
          <ClipboardList aria-hidden className="h-4 w-4 text-[#7B716D]" />
          진행중 업무
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-[#FFF1E8] px-2 py-0.5 text-[9px] font-normal text-[#B97A67]">
            화이팅!
          </span>
          <button
            aria-label="내 알림"
            className="flex h-6 min-w-6 items-center justify-center rounded-full border border-[#E4DCD9] bg-white px-1.5 text-[#4F4542]"
            type="button"
          >
            <Bell aria-hidden className="h-3 w-3 text-[#E30613]" />
          </button>
          <button
            aria-label="게시판으로 이동"
            className="flex h-6 min-w-6 items-center justify-center rounded-full border border-[#E4DCD9] bg-white px-1.5 text-[#4F4542]"
            onClick={onBoardOpen}
            type="button"
          >
            <Newspaper aria-hidden className="h-3.5 w-3.5 text-[#2D70CB]" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {Object.entries(categoryLabels).map(([category, label]) => (
          <article
            className="flex min-h-[58px] flex-col items-center justify-center rounded-[10px] border border-dashed border-[#E4DCD9] bg-white px-1 text-center"
            key={category}
          >
            <p className="break-keep text-[9px] font-normal leading-3 text-[#4F4542]">{label}</p>
            <p className={`mt-1 text-[17px] font-normal leading-none ${categoryColorClassNames[category as keyof typeof categoryColorClassNames]}`}>
              {summaryMap.get(category as keyof typeof categoryLabels) ?? 0}건
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function getPositionName(positionName: string | null, roleType: AdminDashboard["currentMember"]["roleType"]) {
  return positionName ?? roleLabels[roleType];
}
