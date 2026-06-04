import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { MemberRole } from "../enum/member-role.enum";

@Entity({ name: "member" })
export class Member extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: "password_hash" })
  passwordHash: string;

  @Column({ name: "avatar_url", type: "varchar", nullable: true })
  avatarUrl: string | null;

  @Column({
    name: "role_type",
    type: "enum",
    enum: MemberRole
  })
  roleType: MemberRole;

  @Column({ name: "is_active", default: true })
  isActive: boolean;
}
