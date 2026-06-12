import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Organization } from "./organization.entity";

@Entity({ name: "branches" })
export class OrganizationBranch extends BaseEntity {
  @Column({ name: "organization_id" })
  organizationId: number;

  @ManyToOne(() => Organization, (organization) => organization.branches)
  @JoinColumn({ name: "organization_id" })
  organization: Organization;

  @Column()
  name: string;

  @Column({ name: "display_order", default: 0 })
  displayOrder: number;

  @Column({ name: "is_active", default: true })
  isActive: boolean;
}
