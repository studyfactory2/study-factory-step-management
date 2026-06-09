import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Member } from "../../member/entity/member.entity";
import { Task } from "./task.entity";

@Index(["taskId", "memberId"], { unique: true })
@Entity({ name: "task_read_statuses" })
export class TaskReadStatus extends BaseEntity {
  @Column({ name: "task_id" })
  taskId: number;

  @ManyToOne(() => Task, (task) => task.readStatuses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task: Task;

  @Column({ name: "member_id" })
  memberId: number;

  @ManyToOne(() => Member, { onDelete: "CASCADE" })
  @JoinColumn({ name: "member_id" })
  member: Member;

  @Column({ name: "last_viewed_at", type: "timestamp" })
  lastViewedAt: Date;
}
