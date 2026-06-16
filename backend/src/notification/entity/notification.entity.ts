import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Member } from "../../member/entity/member.entity";
import { Task } from "../../task/entity/task.entity";
import { NotificationType } from "../enum/notification-type.enum";

@Entity({ name: "notifications" })
export class Notification extends BaseEntity {
  @Column({ name: "recipient_id" })
  recipientId: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: "recipient_id" })
  recipient: Member;

  @Column({ name: "actor_id" })
  actorId: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: "actor_id" })
  actor: Member;

  @Column({ name: "task_id" })
  taskId: number;

  @ManyToOne(() => Task, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task: Task;

  @Column({
    type: "enum",
    enumName: "notification_type_enum",
    enum: NotificationType
  })
  type: NotificationType;

  @Column({ name: "comment_preview", type: "varchar", nullable: true })
  commentPreview: string | null;

  @Column({ name: "is_read", default: false })
  isRead: boolean;

  @Column({ name: "read_at", type: "timestamp", nullable: true })
  readAt: Date | null;
}
