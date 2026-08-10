import { Bell, ClipboardList, Newspaper } from "lucide-react";
import { type AdminDashboard } from "@/api/admin";
import {
  type TaskCategory,
  type TaskCategorySummaryItem,
} from "@/api/task";
import { roleLabels } from "@/components/adminDashboard/constants";

const categoryLabels = {
  DEVELOPMENT: "개발관련",
  OPERATION: "운영관련",
  MEMBER: "회원관련",
  ORDER: "주문관련",
} as const;

const categoryColorClassNames = {
  DEVELOPMENT: "text-[#3182F6]",
  OPERATION: "text-[#F04452]",
  MEMBER: "text-[#8B5CF6]",
  ORDER: "text-[#F59F00]",
} as const;

const categoryBackgroundClassNames = {
  DEVELOPMENT: "bg-[linear-gradient(135deg,#f5f9ff,#eaf3ff)]",
  OPERATION: "bg-[linear-gradient(135deg,#fff7f8,#ffedef)]",
  MEMBER: "bg-[linear-gradient(135deg,#faf7ff,#f1eaff)]",
  ORDER: "bg-[linear-gradient(135deg,#fffaf0,#fff2d6)]",
} as const;

const categoryBorderClassNames = {
  DEVELOPMENT: "border-[#3182F6]",
  OPERATION: "border-[#F04452]",
  MEMBER: "border-[#8B5CF6]",
  ORDER: "border-[#F59F00]",
} as const;

export function InProgressCategorySection({
  categorySummary,
  notificationUnreadCount = 0,
  onBoardOpen,
  onCategoryToggle,
  onNotificationOpen,
  selectedCategory,
}: {
  categorySummary: TaskCategorySummaryItem[];
  notificationUnreadCount?: number;
  onBoardOpen: () => void;
  onCategoryToggle: (category: TaskCategory) => void;
  onNotificationOpen?: () => void;
  selectedCategory: TaskCategory | null;
}) {
  const summaryMap = new Map(
    categorySummary.map((item) => [item.category, item.count]),
  );

  return (
    <section className="surface-card bg-[linear-gradient(145deg,#ffffff_0%,#f6f9ff_55%,#faf7ff_100%)] p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between">
        <h2 className="flex items-start gap-2 pt-0.5 text-xl font-bold tracking-[-0.03em] text-[#191f28] sm:text-2xl">
          <ClipboardList aria-hidden className="mt-0.5 h-5 w-5 text-primary" />
          진행중 업무
        </h2>
        <div className="flex items-center gap-2">
          <button
            aria-label="내 알림"
            className="relative flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#f2f4f6] text-[#4e5968] transition hover:bg-[#e5e8eb]"
            onClick={onNotificationOpen}
            type="button"
          >
            <Bell aria-hidden className="h-5 w-5" />
            {notificationUnreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f04452] px-1 text-[10px] font-bold leading-none text-white">
                {notificationUnreadCount > 99 ? "99+" : notificationUnreadCount}
              </span>
            ) : null}
          </button>
          <button
            aria-label="게시판으로 이동"
            className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#f2f4f6] text-[#4e5968] transition hover:bg-[#e5e8eb]"
            onClick={onBoardOpen}
            type="button"
          >
            <Newspaper aria-hidden className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Object.entries(categoryLabels).map(([category, label]) => {
          const taskCategory = category as TaskCategory;
          const isSelected = selectedCategory === taskCategory;

          return (
            <button
              aria-pressed={isSelected}
              className={`flex min-h-[68px] flex-col items-start justify-center rounded-[15px] border-2 px-4 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition hover:brightness-[0.98] active:scale-[0.99] sm:min-h-[72px] ${categoryBackgroundClassNames[taskCategory]} ${isSelected ? categoryBorderClassNames[taskCategory] : "border-transparent"}`}
              key={taskCategory}
              onClick={() => onCategoryToggle(taskCategory)}
              type="button"
            >
              <span className="break-keep text-sm font-semibold text-[#6b7684]">
                {label}
              </span>
              <span
                className={`mt-1 text-2xl font-extrabold leading-none tracking-[-0.04em] sm:text-[25px] ${categoryColorClassNames[taskCategory]}`}
              >
                {summaryMap.get(taskCategory) ?? 0}
                <span className="ml-1 text-xs font-semibold text-[#8b95a1]">
                  건
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function getPositionName(
  positionName: string | null,
  roleType: AdminDashboard["currentMember"]["roleType"],
) {
  return positionName ?? roleLabels[roleType];
}
