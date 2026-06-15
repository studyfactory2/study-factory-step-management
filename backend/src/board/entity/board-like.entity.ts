import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Member } from "../../member/entity/member.entity";
import { BoardPost } from "./board-post.entity";

@Entity({ name: "board_likes" })
@Unique("uq_board_likes_post_member", ["postId", "memberId"])
export class BoardLike extends BaseEntity {
  @Column({ name: "post_id" })
  postId: number;

  @ManyToOne(() => BoardPost, (post) => post.likes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post: BoardPost;

  @Column({ name: "member_id" })
  memberId: number;

  @ManyToOne(() => Member, { onDelete: "CASCADE" })
  @JoinColumn({ name: "member_id" })
  member: Member;
}
