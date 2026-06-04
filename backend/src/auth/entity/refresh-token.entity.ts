import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Member } from "../../member/entity/member.entity";

@Entity({ name: "refresh_token" })
export class RefreshToken extends BaseEntity {
  @Column({ unique: true })
  token: string;

  @Column({ name: "member_id" })
  memberId: number;

  @OneToOne(() => Member, { eager: true })
  @JoinColumn({ name: "member_id" })
  member: Member;
}
