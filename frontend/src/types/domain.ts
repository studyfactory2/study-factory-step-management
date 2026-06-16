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
  birthDate?: string | null;
  branch: string | null;
  branchInfo?: {
    id: number;
    name: string;
    organizationId: number;
  } | null;
  branchName?: string | null;
  dutyText?: string | null;
  joinedAt?: string | null;
  organization?: {
    id: number;
    name: string;
  } | null;
  organizationId?: number | null;
  organizationName?: string | null;
  positionId: number | null;
  positionInfo?: {
    id: number;
    name: string;
  } | null;
  phoneNumber?: string | null;
  residenceCity?: string | null;
  residenceDistrict?: string | null;
  positionDutyId: number | null;
  positionDuty?: {
    duty: MemberDuty | null;
    id: number;
    name: string | null;
  } | null;
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
