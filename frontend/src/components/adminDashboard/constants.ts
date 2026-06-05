import type { MemberRole, TaskStatus } from "@/types/domain";

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

export const statusLabels: Record<Exclude<TaskStatus, "COMPLETED">, string> = {
  REGISTERED: "업무등록",
  IN_PROGRESS: "진행중",
  REVIEW_REQUESTED: "검토요청"
};
