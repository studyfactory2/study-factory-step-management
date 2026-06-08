import type { Member } from "@/types/domain";

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .format(new Date(value))
    .replace(/\\. /g, ".")
    .replace(/\.$/, "");
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date);
  const dateText = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .format(date)
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
  const timeText = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit"
  }).format(date);

  return `${dateText}(${weekday}) ${timeText}`;
}

export function isAssignableMember(member: Member) {
  return member.isActive && member.roleType !== "CEO" && member.roleType !== "ADMIN";
}
