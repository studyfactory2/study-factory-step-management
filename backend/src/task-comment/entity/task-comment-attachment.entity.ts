import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { TaskComment } from "./task-comment.entity";

@Entity({ name: "task_comment_attachments" })
export class TaskCommentAttachment extends BaseEntity {
  @Column({ name: "task_comment_id" })
  taskCommentId: number;

  @ManyToOne(() => TaskComment, (comment) => comment.attachments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_comment_id" })
  comment: TaskComment;

  @Column({ name: "image_url" })
  imageUrl: string;

  @Column({ name: "original_name", type: "varchar", nullable: true })
  originalName: string | null;
}
