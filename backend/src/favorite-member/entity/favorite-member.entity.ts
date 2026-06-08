import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { Member } from "../../member/entity/member.entity";

@Entity({ name: "favorite_members" })
@Unique("uq_favorite_member_owner_member", ["ownerMemberId", "memberId"])
export class FavoriteMember extends BaseEntity {
  @Column({ name: "owner_member_id" })
  ownerMemberId: number;

  @ManyToOne(() => Member, { onDelete: "CASCADE" })
  @JoinColumn({ name: "owner_member_id" })
  ownerMember: Member;

  @Column({ name: "member_id" })
  memberId: number;

  @ManyToOne(() => Member, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "member_id" })
  member: Member;

  @Column({ name: "display_order", default: 0 })
  displayOrder: number;
}
