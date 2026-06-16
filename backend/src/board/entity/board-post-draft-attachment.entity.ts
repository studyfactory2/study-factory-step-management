import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { BoardPostDraft } from "./board-post-draft.entity";

@Entity({ name: "board_post_draft_attachments" })
export class BoardPostDraftAttachment extends BaseEntity {
  @Column({ name: "draft_id" })
  draftId: number;

  @ManyToOne(() => BoardPostDraft, (draft) => draft.attachments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "draft_id" })
  draft: BoardPostDraft;

  @Column({ name: "image_url" })
  imageUrl: string;

  @Column({ name: "original_name", type: "varchar", nullable: true })
  originalName: string | null;

  @Column({ name: "display_order", type: "int", default: 0 })
  displayOrder: number;
}
