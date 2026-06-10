import type { AdminDashboardEmployee } from "@/api/admin";
import { roleLabels } from "@/components/adminDashboard/constants";
import type { TaskStatus } from "@/types/domain";

export const selectableStatuses: TaskStatus[] = ["REGISTERED", "IN_PROGRESS", "REVIEW_REQUESTED", "COMPLETED"];

export function getStatusLabel(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "업무등록";
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
    return "bg-[#FBE6EA] text-primary";
  }

  if (status === "IN_PROGRESS") {
    return "bg-[#EEE8FF] text-[#8B72C8]";
  }

  if (status === "REVIEW_REQUESTED") {
    return "bg-[#FFF1D7] text-[#C88449]";
  }

  return "bg-[#E8F3DF] text-[#6D956A]";
}

export function getMemberPositionName(member: AdminDashboardEmployee) {
  return member.positionName ?? roleLabels[member.roleType];
}
