import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Member } from "../../member/entity/member.entity";
import { Task } from "../../task/entity/task.entity";
import { HelpRequestAttachment } from "./help-request-attachment.entity";

@Entity({ name: "help_requests" })
export class HelpRequest extends BaseEntity {
  @Column({ name: "task_id" })
  taskId: number;

  @ManyToOne(() => Task, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task: Task;

  @Column({ name: "requester_id" })
  requesterId: number;

  @ManyToOne(() => Member, { onDelete: "CASCADE" })
  @JoinColumn({ name: "requester_id" })
  requester: Member;

  @Column({ name: "receiver_id" })
  receiverId: number;

  @ManyToOne(() => Member, { onDelete: "CASCADE" })
  @JoinColumn({ name: "receiver_id" })
  receiver: Member;

  @Column({ type: "text" })
  content: string;

  @OneToMany(() => HelpRequestAttachment, (attachment) => attachment.helpRequest)
  attachments: HelpRequestAttachment[];
}
