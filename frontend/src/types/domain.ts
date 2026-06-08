export type TaskStatus = "REGISTERED" | "IN_PROGRESS" | "REVIEW_REQUESTED" | "COMPLETED";

export type MemberRole =
  | "CEO"
  | "ADMIN"
  | "OPERATIONS_MANAGER"
  | "FACTORY_MANAGER"
  | "DEVELOPMENT_LEAD"
  | "DESIGNER"
  | "MARKETER"
  | "DEVELOPER"
  | "CONTENT_MANAGER"
  | "EMPLOYEE"
  | "STAFF";

export type MemberPosition =
  | "DEVELOPMENT_LEAD"
  | "DEVELOPER"
  | "STAFF"
  | "EMPLOYEE"
  | "CEO"
  | "ADMIN"
  | "FACTORY_MANAGER";

export type MemberAffiliation = "DEVELOPMENT_TEAM" | "STAFF" | "ADMIN" | "CEO";

export type MemberDuty = "DEVELOPMENT" | "BEVERAGE" | "FOOD" | "CLEANING" | "GENERAL";

export type Member = {
  id: number;
  name: string;
  avatarUrl: string | null;
  branch: string | null;
  affiliation: MemberAffiliation | null;
  position: MemberPosition | null;
  roleType: MemberRole;
  duty: MemberDuty | null;
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
