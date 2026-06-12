import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { PositionDuty } from "../../position/entity/position-duty.entity";
import { Position } from "../../position/entity/position.entity";
import { MemberRole } from "../enum/member-role.enum";
import { OrganizationBranch } from "./organization-branch.entity";
import { Organization } from "./organization.entity";

@Entity({ name: "member" })
export class Member extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: "display_name", type: "varchar", nullable: true })
  displayName: string | null;

  @Column({ name: "password_hash" })
  passwordHash: string;

  @Column({ name: "avatar_url", type: "varchar", nullable: true })
  avatarUrl: string | null;

  @Column({ type: "int", nullable: true })
  age: number | null;

  @Column({ name: "joined_at", type: "date", nullable: true })
  joinedAt: string | null;

  @Column({ name: "phone_number", type: "varchar", nullable: true })
  phoneNumber: string | null;

  @Column({ name: "duty_text", type: "varchar", nullable: true })
  dutyText: string | null;

  @Column({ name: "organization_id", type: "int", nullable: true })
  organizationId: number | null;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: "organization_id" })
  organization: Organization | null;

  @Column({ name: "branch_id", type: "int", nullable: true })
  branchId: number | null;

  @ManyToOne(() => OrganizationBranch, { nullable: true })
  @JoinColumn({ name: "branch_id" })
  branchInfo: OrganizationBranch | null;

  @Column({ name: "position_id", type: "int", nullable: true })
  positionId: number | null;

  @ManyToOne(() => Position, { nullable: true })
  @JoinColumn({ name: "position_id" })
  positionInfo: Position | null;

  @Column({ name: "position_duty_id", type: "int", nullable: true })
  positionDutyId: number | null;

  @ManyToOne(() => PositionDuty, { nullable: true })
  @JoinColumn({ name: "position_duty_id" })
  positionDuty: PositionDuty | null;

  @Column({
    name: "role_type",
    type: "enum",
    enumName: "member_role_type_enum",
    enum: MemberRole
  })
  roleType: MemberRole;

  @Column({ name: "is_active", default: true })
  isActive: boolean;
}
