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
  OPERATIONS_MANAGER: "운영관리자",
  FACTORY_MANAGER: "공장장",
  DEVELOPMENT_LEAD: "개발팀장",
  DESIGNER: "디자이너",
  MARKETER: "마케팅",
  DEVELOPER: "개발자",
  CONTENT_MANAGER: "콘텐츠 담당",
  EMPLOYEE: "직원",
  STAFF: "스텝"
};

export const positionLabels: Record<MemberPosition, string> = {
  DEVELOPMENT_LEAD: "개발팀장",
  DEVELOPER: "개발자",
  STAFF: "스텝",
  EMPLOYEE: "직원",
  CEO: "CEO",
  ADMIN: "admin",
  FACTORY_MANAGER: "공장장"
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
