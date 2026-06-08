import type {
  MemberAffiliation,
  MemberDuty,
  MemberPosition,
  MemberRole,
  TaskStatus
} from "@/types/domain";

export const ALL_ASSIGNEES_VALUE = "__ALL__";

export const roleLabels: Record<MemberRole, string> = {
  CEO: "대표",
  ADMIN: "관리자",
  EMPLOYEE: "직원"
};

export const positionLabels: Record<MemberPosition, string> = {
  DEVELOPMENT_LEAD: "개발팀장",
  DEVELOPER: "개발자",
  STAFF: "스텝",
  EMPLOYEE: "직원",
  CEO: "CEO",
  ADMIN: "admin",
  OPERATIONS_MANAGER: "운영관리자"
};

export const affiliationLabels: Record<MemberAffiliation, string> = {
  DEVELOPMENT_TEAM: "개발 팀",
  STAFF: "스텝",
  ADMIN: "admin",
  CEO: "CEO"
};

export const dutyLabels: Record<MemberDuty, string> = {
  DEVELOPMENT: "개발",
  BEVERAGE: "음료",
  FOOD: "음식",
  CLEANING: "청소",
  GENERAL: "총괄"
};

export const statusLabels: Record<Exclude<TaskStatus, "COMPLETED">, string> = {
  REGISTERED: "업무등록",
  IN_PROGRESS: "진행중",
  REVIEW_REQUESTED: "검토요청"
};
