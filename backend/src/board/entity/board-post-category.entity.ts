import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { BoardCategory } from "./board-category.entity";
import { BoardPost } from "./board-post.entity";

@Entity({ name: "board_post_categories" })
export class BoardPostCategory extends BaseEntity {
  @Column({ name: "post_id" })
  postId: number;

  @ManyToOne(() => BoardPost, (post) => post.postCategories, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post: BoardPost;

  @Column({ name: "category_id" })
  categoryId: number;

  @ManyToOne(() => BoardCategory, (category) => category.postCategories)
  @JoinColumn({ name: "category_id" })
  category: BoardCategory;
}
