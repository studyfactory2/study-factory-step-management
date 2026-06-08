import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MemberDuty } from "../member/enum/member-duty.enum";
import { PositionDuty } from "./entity/position-duty.entity";
import { Position } from "./entity/position.entity";

@Injectable()
export class PositionRepository {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @InjectRepository(PositionDuty)
    private readonly positionDutyRepository: Repository<PositionDuty>
  ) {}

  async findActivePositions(): Promise<Position[]> {
    return this.positionRepository.find({
      relations: {
        dutyLinks: true
      },
      where: {
        isActive: true
      },
      order: {
        displayOrder: "ASC",
        id: "ASC"
      }
    });
  }

  async findActiveByCode(code: string): Promise<Position | null> {
    return this.positionRepository.findOne({
      where: {
        code,
        isActive: true
      }
    });
  }

  async findDutyByPositionIdAndDuty(
    positionId: number,
    duty: MemberDuty
  ): Promise<PositionDuty | null> {
    return this.positionDutyRepository.findOne({
      where: {
        positionId,
        duty
      }
    });
  }
}
