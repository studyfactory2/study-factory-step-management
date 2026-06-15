import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Member } from "../../member/entity/member.entity";
import { BoardPost } from "./board-post.entity";

@Entity({ name: "board_views" })
export class BoardView extends BaseEntity {
  @Column({ name: "post_id" })
  postId: number;

  @ManyToOne(() => BoardPost, (post) => post.views, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post: BoardPost;

  @Column({ name: "member_id" })
  memberId: number;

  @ManyToOne(() => Member, { onDelete: "CASCADE" })
  @JoinColumn({ name: "member_id" })
  member: Member;

  @Column({ name: "last_viewed_at", type: "timestamp" })
  lastViewedAt: Date;
}
