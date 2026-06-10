import type { TaskStatusSummary } from "@/api/task";

export type StatusCardItem = {
  label: string;
  value: string;
  helper: string;
  tone: "pink" | "lavender" | "gold" | "sage";
};

export const defaultSummary: TaskStatusSummary = {
  registered: 0,
  registeredToday: 0,
  inProgress: 0,
  inProgressWeeklyChange: 0,
  reviewRequested: 0,
  reviewRequestedWeeklyChange: 0,
  completedThisMonth: 0
};

export function createStatusCards(summary: TaskStatusSummary): StatusCardItem[] {
  return [
    {
      label: "업무등록",
      value: String(summary.registered),
      helper: `오늘 ${summary.registeredToday}건`,
      tone: "pink"
    },
    {
      label: "진행 중",
      value: String(summary.inProgress),
      helper: formatWeeklyChange(summary.inProgressWeeklyChange),
      tone: "lavender"
    },
    {
      label: "검토요청",
      value: String(summary.reviewRequested),
      helper: formatWeeklyChange(summary.reviewRequestedWeeklyChange),
      tone: "gold"
    },
    {
      label: "완료",
      value: String(summary.completedThisMonth),
      helper: "이번 달 완료",
      tone: "sage"
    }
  ];
}

function formatWeeklyChange(change: number): string {
  if (change > 0) {
    return `↑ ${change}건`;
  }

  if (change < 0) {
    return `↓ ${Math.abs(change)}건`;
  }

  return "지난주 대비 -";
}
