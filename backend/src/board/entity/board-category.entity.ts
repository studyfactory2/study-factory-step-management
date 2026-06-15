import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { BoardPostCategory } from "./board-post-category.entity";

@Entity({ name: "board_categories" })
export class BoardCategory extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: "varchar", nullable: true })
  icon: string | null;

  @Column({ name: "color_class_name", type: "varchar", nullable: true })
  colorClassName: string | null;

  @Column({ name: "display_order", type: "int", default: 0 })
  displayOrder: number;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @OneToMany(() => BoardPostCategory, (postCategory) => postCategory.category)
  postCategories: BoardPostCategory[];
}
