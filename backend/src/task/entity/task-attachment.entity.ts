import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Task } from "./task.entity";

@Entity({ name: "task_attachments" })
export class TaskAttachment extends BaseEntity {
  @Column({ name: "task_id" })
  taskId: number;

  @ManyToOne(() => Task, (task) => task.attachments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task: Task;

  @Column({ name: "image_url" })
  imageUrl: string;

  @Column({ name: "original_name", type: "varchar", nullable: true })
  originalName: string | null;
}
