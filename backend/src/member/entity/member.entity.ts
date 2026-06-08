import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { PositionDuty } from "../../position/entity/position-duty.entity";
import { Position } from "../../position/entity/position.entity";
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
