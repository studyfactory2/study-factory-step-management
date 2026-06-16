import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { BoardCategory } from "./board-category.entity";
import { BoardPostDraft } from "./board-post-draft.entity";

@Entity({ name: "board_post_draft_categories" })
export class BoardPostDraftCategory extends BaseEntity {
  @Column({ name: "draft_id" })
  draftId: number;

  @ManyToOne(() => BoardPostDraft, (draft) => draft.draftCategories, { onDelete: "CASCADE" })
  @JoinColumn({ name: "draft_id" })
  draft: BoardPostDraft;

  @Column({ name: "category_id" })
  categoryId: number;

  @ManyToOne(() => BoardCategory)
  @JoinColumn({ name: "category_id" })
  category: BoardCategory;
}
