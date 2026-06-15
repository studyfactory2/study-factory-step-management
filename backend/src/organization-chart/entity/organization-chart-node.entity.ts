import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Member } from "../../member/entity/member.entity";
import { Organization } from "../../member/entity/organization.entity";
import { Position } from "../../position/entity/position.entity";
import { OrganizationChart } from "./organization-chart.entity";

@Entity({ name: "organization_chart_nodes" })
export class OrganizationChartNode extends BaseEntity {
  @Column({ name: "chart_id" })
  chartId: number;

  @ManyToOne(() => OrganizationChart, (chart) => chart.nodes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "chart_id" })
  chart: OrganizationChart;

  @Column({ name: "parent_id", type: "int", nullable: true })
  parentId: number | null;

  @ManyToOne(() => OrganizationChartNode, (node) => node.children, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "parent_id" })
  parent: OrganizationChartNode | null;

  @OneToMany(() => OrganizationChartNode, (node) => node.parent)
  children: OrganizationChartNode[];

  @Column()
  floor: number;

  @Column({ name: "slot_key" })
  slotKey: string;

  @Column({ name: "display_order", default: 0 })
  displayOrder: number;

  @Column({ name: "is_enabled", default: true })
  isEnabled: boolean;

  @Column({ name: "organization_id", type: "int", nullable: true })
  organizationId: number | null;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: "organization_id" })
  organization: Organization | null;

  @Column({ name: "position_id", type: "int", nullable: true })
  positionId: number | null;

  @ManyToOne(() => Position, { nullable: true })
  @JoinColumn({ name: "position_id" })
  position: Position | null;

  @Column({ name: "member_id", type: "int", nullable: true })
  memberId: number | null;

  @ManyToOne(() => Member, { nullable: true })
  @JoinColumn({ name: "member_id" })
  member: Member | null;

  @Column({ name: "image_url", type: "varchar", nullable: true })
  imageUrl: string | null;

  @Column({ name: "display_name", type: "varchar", nullable: true })
  displayName: string | null;
}
