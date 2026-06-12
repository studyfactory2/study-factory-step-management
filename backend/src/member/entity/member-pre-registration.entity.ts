import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { PositionDuty } from "../../position/entity/position-duty.entity";
import { Position } from "../../position/entity/position.entity";
import { MemberAffiliation } from "../enum/member-affiliation.enum";
import { MemberDuty } from "../enum/member-duty.enum";
import { MemberPosition } from "../enum/member-position.enum";
import { MemberRole } from "../enum/member-role.enum";
import { OrganizationBranch } from "./organization-branch.entity";
import { Organization } from "./organization.entity";

@Index(["name", "branch", "affiliation", "position", "duty"], { unique: true })
@Entity({ name: "member_pre_registration" })
export class MemberPreRegistration extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: "enum",
    enumName: "member_pre_registration_affiliation_enum",
    enum: MemberAffiliation,
    nullable: true
  })
  affiliation: MemberAffiliation | null;

  @Column({
    type: "enum",
    enumName: "member_pre_registration_position_enum",
    enum: MemberPosition,
    nullable: true
  })
  position: MemberPosition | null;

  @Column({
    name: "role_type",
    type: "enum",
    enum: MemberRole
  })
  roleType: MemberRole;

  @Column({
    type: "enum",
    enumName: "member_pre_registration_duty_enum",
    enum: MemberDuty,
    nullable: true
  })
  duty: MemberDuty | null;

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

  @Column({ type: "varchar", nullable: true })
  branch: string | null;

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

  @Column({ name: "is_registered", default: false })
  isRegistered: boolean;
}
