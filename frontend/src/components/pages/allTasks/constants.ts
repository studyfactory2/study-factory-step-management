import type { TaskStatus } from "@/types/domain";

export type SortOrder = "LATEST" | "OLDEST";

export const taskStatusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "등록 업무", value: "REGISTERED" },
  { label: "진행 중", value: "IN_PROGRESS" },
  { label: "검토 요청", value: "REVIEW_REQUESTED" },
  { label: "완료", value: "COMPLETED" }
];

export function getStatusLabel(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "업무 등록";
  }

  if (status === "IN_PROGRESS") {
    return "진행";
  }

  if (status === "REVIEW_REQUESTED") {
    return "검토 요청";
  }

  return "완료";
}

export function getStatusClassName(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "bg-[#fff0f2] text-[#f04452]";
  }

  if (status === "IN_PROGRESS") {
    return "bg-[#fff7d6] text-[#b77900]";
  }

  if (status === "REVIEW_REQUESTED") {
    return "bg-[#eaf3ff] text-[#3182f6]";
  }

  return "bg-[#f2f4f6] text-[#6b7684]";
}
