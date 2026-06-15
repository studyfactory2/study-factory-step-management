import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Member } from "../../member/entity/member.entity";
import { BoardPostType } from "../enum/board-post-type.enum";
import { BoardVisibility } from "../enum/board-visibility.enum";
import { BoardComment } from "./board-comment.entity";
import { BoardLike } from "./board-like.entity";
import { BoardPostAttachment } from "./board-post-attachment.entity";
import { BoardPostCategory } from "./board-post-category.entity";
import { BoardView } from "./board-view.entity";

@Entity({ name: "board_posts" })
export class BoardPost extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: "text" })
  content: string;

  @Column({ name: "one_line_comment", type: "varchar", nullable: true })
  oneLineComment: string | null;

  @Column({
    name: "post_type",
    type: "enum",
    enumName: "board_post_type_enum",
    enum: BoardPostType,
    default: BoardPostType.EMPLOYEE
  })
  postType: BoardPostType;

  @Column({
    type: "enum",
    enumName: "board_visibility_enum",
    enum: BoardVisibility,
    default: BoardVisibility.ALL
  })
  visibility: BoardVisibility;

  @Column({ name: "created_by" })
  createdBy: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: "created_by" })
  creator: Member;

  @Column({ name: "is_pinned", default: false })
  isPinned: boolean;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @OneToMany(() => BoardPostCategory, (postCategory) => postCategory.post)
  postCategories: BoardPostCategory[];

  @OneToMany(() => BoardPostAttachment, (attachment) => attachment.post)
  attachments: BoardPostAttachment[];

  @OneToMany(() => BoardComment, (comment) => comment.post)
  comments: BoardComment[];

  @OneToMany(() => BoardLike, (like) => like.post)
  likes: BoardLike[];

  @OneToMany(() => BoardView, (view) => view.post)
  views: BoardView[];
}
