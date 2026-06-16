import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Member } from "../../member/entity/member.entity";
import { BoardPostType } from "../enum/board-post-type.enum";
import { BoardVisibility } from "../enum/board-visibility.enum";
import { BoardPostDraftAttachment } from "./board-post-draft-attachment.entity";
import { BoardPostDraftCategory } from "./board-post-draft-category.entity";

@Entity({ name: "board_post_drafts" })
export class BoardPostDraft extends BaseEntity {
  @Column({ type: "varchar", default: "" })
  title: string;

  @Column({ type: "text", default: "" })
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

  @OneToMany(() => BoardPostDraftCategory, (draftCategory) => draftCategory.draft)
  draftCategories: BoardPostDraftCategory[];

  @OneToMany(() => BoardPostDraftAttachment, (attachment) => attachment.draft)
  attachments: BoardPostDraftAttachment[];
}
