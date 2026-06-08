import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Position } from "../../position/entity/position.entity";
import { MemberAffiliation } from "../enum/member-affiliation.enum";
import { MemberDuty } from "../enum/member-duty.enum";
import { MemberPosition } from "../enum/member-position.enum";
import { MemberRole } from "../enum/member-role.enum";

@Entity({ name: "member" })
export class Member extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: "password_hash" })
  passwordHash: string;

  @Column({ name: "avatar_url", type: "varchar", nullable: true })
  avatarUrl: string | null;

  @Column({ type: "varchar", nullable: true })
  branch: string | null;

  @Column({
    type: "enum",
    enumName: "member_affiliation_enum",
    enum: MemberAffiliation,
    nullable: true
  })
  affiliation: MemberAffiliation | null;

  @Column({
    type: "enum",
    enumName: "member_position_enum",
    enum: MemberPosition,
    nullable: true
  })
  position: MemberPosition | null;

  @Column({ name: "position_id", type: "int", nullable: true })
  positionId: number | null;

  @ManyToOne(() => Position, { nullable: true })
  @JoinColumn({ name: "position_id" })
  positionInfo: Position | null;

  @Column({
    name: "role_type",
    type: "enum",
    enumName: "member_role_type_enum",
    enum: MemberRole
  })
  roleType: MemberRole;

  @Column({
    type: "enum",
    enumName: "member_duty_enum",
    enum: MemberDuty,
    nullable: true
  })
  duty: MemberDuty | null;

  @Column({ name: "is_active", default: true })
  isActive: boolean;
}
