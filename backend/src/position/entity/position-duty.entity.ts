import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { MemberDuty } from "../../member/enum/member-duty.enum";
import { Position } from "./position.entity";

@Index(["positionId", "duty"], { unique: true })
@Entity({ name: "position_duties" })
export class PositionDuty extends BaseEntity {
  @Column({ name: "position_id", type: "int" })
  positionId: number;

  @ManyToOne(() => Position, (position) => position.dutyLinks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "position_id" })
  position: Position;

  @Column({
    type: "enum",
    enumName: "member_duty_enum",
    enum: MemberDuty,
    nullable: true
  })
  duty: MemberDuty | null;

  @Column({ type: "varchar", nullable: true })
  name: string | null;
}
