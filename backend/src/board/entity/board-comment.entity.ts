import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Member } from "../../member/entity/member.entity";
import { BoardPost } from "./board-post.entity";

@Entity({ name: "board_comments" })
export class BoardComment extends BaseEntity {
  @Column({ name: "post_id" })
  postId: number;

  @ManyToOne(() => BoardPost, (post) => post.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post: BoardPost;

  @Column({ name: "created_by" })
  createdBy: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: "created_by" })
  creator: Member;

  @Column({ type: "text" })
  content: string;

  @Column({ name: "is_active", default: true })
  isActive: boolean;
}
