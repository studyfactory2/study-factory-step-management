import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { MemberAffiliation } from "../enum/member-affiliation.enum";
import { MemberDuty } from "../enum/member-duty.enum";
import { MemberPosition } from "../enum/member-position.enum";
import { MemberRole } from "../enum/member-role.enum";

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

  @Column({ type: "varchar", nullable: true })
  branch: string | null;

  @Column({ name: "is_registered", default: false })
  isRegistered: boolean;
}
