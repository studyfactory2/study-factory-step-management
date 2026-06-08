import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { PositionDuty } from "./position-duty.entity";

@Entity({ name: "member_positions" })
export class Position extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: "varchar", nullable: true })
  subtitle: string | null;

  @Column({ name: "parent_id", type: "int", nullable: true })
  parentId: number | null;

  @ManyToOne(() => Position, (position) => position.children, { nullable: true })
  @JoinColumn({ name: "parent_id" })
  parent: Position | null;

  @OneToMany(() => Position, (position) => position.parent)
  children: Position[];

  @OneToMany(() => PositionDuty, (positionDuty) => positionDuty.position)
  dutyLinks: PositionDuty[];

  @Column({ name: "display_order", default: 0 })
  displayOrder: number;

  @Column({ name: "is_login_visible", default: true })
  isLoginVisible: boolean;

  @Column({ name: "is_admin", default: false })
  isAdmin: boolean;

  @Column({ name: "is_active", default: true })
  isActive: boolean;
}
