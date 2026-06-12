import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { OrganizationChartNode } from "./organization-chart-node.entity";

@Entity({ name: "organization_charts" })
export class OrganizationChart extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: "is_active", default: false })
  isActive: boolean;

  @OneToMany(() => OrganizationChartNode, (node) => node.chart)
  nodes: OrganizationChartNode[];
}
