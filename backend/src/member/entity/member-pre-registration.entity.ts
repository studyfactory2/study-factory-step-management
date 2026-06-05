import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { MemberRole } from "../enum/member-role.enum";

@Index(["name", "roleType", "branch"], { unique: true })
@Entity({ name: "member_pre_registration" })
export class MemberPreRegistration extends BaseEntity {
  @Column()
  name: string;

  @Column({
    name: "role_type",
    type: "enum",
    enum: MemberRole
  })
  roleType: MemberRole;

  @Column({ type: "varchar", nullable: true })
  branch: string | null;

  @Column({ name: "is_registered", default: false })
  isRegistered: boolean;
}
