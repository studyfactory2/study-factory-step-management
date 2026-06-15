import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { BoardPost } from "./board-post.entity";

@Entity({ name: "board_post_attachments" })
export class BoardPostAttachment extends BaseEntity {
  @Column({ name: "post_id" })
  postId: number;

  @ManyToOne(() => BoardPost, (post) => post.attachments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post: BoardPost;

  @Column({ name: "image_url" })
  imageUrl: string;

  @Column({ name: "original_name", type: "varchar", nullable: true })
  originalName: string | null;

  @Column({ name: "display_order", type: "int", default: 0 })
  displayOrder: number;
}
