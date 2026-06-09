import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Member } from "../../member/entity/member.entity";
import { TaskComment } from "../../task-comment/entity/task-comment.entity";
import { TaskAttachment } from "./task-attachment.entity";
import { TaskStatus } from "../enum/task-status.enum";

@Entity({ name: "tasks" })
export class Task extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ name: "description_highlight_start", type: "int", nullable: true })
  descriptionHighlightStart: number | null;

  @Column({ name: "description_highlight_end", type: "int", nullable: true })
  descriptionHighlightEnd: number | null;

  @Column({ name: "description_highlight_expires_at", type: "timestamp", nullable: true })
  descriptionHighlightExpiresAt: Date | null;

  @Column({ name: "one_line_comment", type: "varchar", nullable: true })
  oneLineComment: string | null;

  @Column({
    type: "enum",
    enumName: "task_status_enum",
    enum: TaskStatus
  })
  status: TaskStatus;

  @Column({ name: "assignee_id" })
  assigneeId: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: "assignee_id" })
  assignee: Member;

  @Column({ name: "created_by" })
  createdBy: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: "created_by" })
  creator: Member;

  @Column({ name: "completed_at", type: "timestamp", nullable: true })
  completedAt: Date | null;

  @Column({ name: "review_requested_at", type: "timestamp", nullable: true })
  reviewRequestedAt: Date | null;

  @Column({ name: "is_draft", default: false })
  isDraft: boolean;

  @OneToMany(() => TaskAttachment, (attachment) => attachment.task)
  attachments: TaskAttachment[];

  @OneToMany(() => TaskComment, (comment) => comment.task)
  comments: TaskComment[];
}
