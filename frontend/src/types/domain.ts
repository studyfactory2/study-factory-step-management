export type TaskStatus = "REGISTERED" | "IN_PROGRESS" | "REVIEW_REQUESTED" | "COMPLETED";

export type MemberRole =
  | "CEO"
  | "OPERATIONS_MANAGER"
  | "DEVELOPMENT_LEAD"
  | "DESIGNER"
  | "MARKETER"
  | "DEVELOPER"
  | "CONTENT_MANAGER"
  | "STAFF";

export type Member = {
  id: number;
  loginId: string;
  name: string;
  avatarUrl: string | null;
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
  dueAt: string | null;
  completedAt: string | null;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
};
