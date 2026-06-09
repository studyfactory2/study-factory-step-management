export type TaskStatus = "REGISTERED" | "IN_PROGRESS" | "REVIEW_REQUESTED" | "COMPLETED";

export type MemberRole =
  | "CEO"
  | "ADMIN"
  | "EMPLOYEE";

export type MemberPosition =
  | "DEVELOPMENT_LEAD"
  | "DEVELOPER"
  | "STAFF"
  | "EMPLOYEE"
  | "CEO"
  | "ADMIN"
  | "OPERATIONS_MANAGER";

export type MemberAffiliation = "DEVELOPMENT_TEAM" | "STAFF" | "ADMIN" | "CEO";

export type MemberDuty = "DEVELOPMENT" | "BEVERAGE" | "FOOD" | "CLEANING" | "GENERAL";

export type Member = {
  id: number;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
  branch: string | null;
  positionId: number | null;
  positionInfo?: {
    id: number;
    code: string;
    name: string;
  } | null;
  positionDutyId: number | null;
  roleType: MemberRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: number;
  createdBy: number;
  completedAt: string | null;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskAttachment = {
  id: number;
  taskId: number;
  imageUrl: string;
  originalName: string | null;
  createdAt: string;
  updatedAt: string;
};
