import { TaskCategory } from "../enum/task-category.enum";

export class TaskDraftResponse {
  id: number;
  title: string;
  description: string;
  category: TaskCategory;
  oneLineComment: string | null;
  assigneeId: number;
  createdAt: Date;
  updatedAt: Date;
}
