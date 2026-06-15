import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { OrganizationBranch } from "./organization-branch.entity";

@Entity({ name: "organizations" })
export class Organization extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ name: "display_order", default: 0 })
  displayOrder: number;

  @Column({ name: "color_index", type: "int", nullable: true })
  colorIndex: number | null;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @OneToMany(() => OrganizationBranch, (branch) => branch.organization)
  branches: OrganizationBranch[];
}
