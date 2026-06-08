import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Member } from "../../member/entity/member.entity";
import { Task } from "../../task/entity/task.entity";
import { TaskCommentAttachment } from "./task-comment-attachment.entity";

@Entity({ name: "task_comments" })
export class TaskComment extends BaseEntity {
  @Column({ name: "task_id" })
  taskId: number;

  @ManyToOne(() => Task, (task) => task.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task: Task;

  @Column({ name: "created_by" })
  createdBy: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: "created_by" })
  creator: Member;

  @Column({ type: "text" })
  content: string;

  @Column({ name: "one_line_comment", type: "varchar", nullable: true })
  oneLineComment: string | null;

  @OneToMany(() => TaskCommentAttachment, (attachment) => attachment.comment)
  attachments: TaskCommentAttachment[];
}
