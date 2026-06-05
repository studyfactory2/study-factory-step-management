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
  | "STAFF";

export type Member = {
  id: number;
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

export type TaskAttachment = {
  id: number;
  taskId: number;
  imageUrl: string;
  originalName: string | null;
  createdAt: string;
  updatedAt: string;
};
