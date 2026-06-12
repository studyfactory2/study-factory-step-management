import type { TaskStatus } from "@/types/domain";

export const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "업무등록", value: "REGISTERED" },
  { label: "진행중", value: "IN_PROGRESS" },
  { label: "검토요청", value: "REVIEW_REQUESTED" },
  { label: "완료", value: "COMPLETED" }
];

export function getStatusLabel(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "업무 등록";
  }

  if (status === "IN_PROGRESS") {
    return "진행중";
  }

  if (status === "REVIEW_REQUESTED") {
    return "검토요청";
  }

  return "완료";
}

export function getStatusClassName(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "border-[#F3C9D5] bg-[#FFF0F4] text-[#D93D72]";
  }

  if (status === "IN_PROGRESS") {
    return "border-[#E7CD6C] bg-[#FFF6D8] text-[#9A7416]";
  }

  if (status === "REVIEW_REQUESTED") {
    return "border-[#9ECBF2] bg-[#EAF6FF] text-[#1572CC]";
  }

  return "border-[#D9D9D9] bg-[#F3F3F3] text-[#6B6B6B]";
}
