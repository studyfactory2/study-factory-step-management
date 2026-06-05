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

export function isAssignableMember(member: Member) {
  return member.isActive && member.roleType !== "CEO" && member.roleType !== "ADMIN";
}
