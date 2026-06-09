import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Member } from "../member/entity/member.entity";
import { MemberDuty } from "../member/enum/member-duty.enum";
import { PositionDuty } from "./entity/position-duty.entity";
import { Position } from "./entity/position.entity";

@Injectable()
export class PositionRepository {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @InjectRepository(PositionDuty)
    private readonly positionDutyRepository: Repository<PositionDuty>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>
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

  async findActiveById(id: number): Promise<Position | null> {
    return this.positionRepository.findOne({
      relations: {
        dutyLinks: true
      },
      where: {
        id,
        isActive: true
      }
    });
  }

  async save(position: Position): Promise<Position> {
    return this.positionRepository.save(position);
  }

  async saveDuty(positionDuty: PositionDuty): Promise<PositionDuty> {
    return this.positionDutyRepository.save(positionDuty);
  }

  async updateTreeNodes(
    nodes: {
      displayOrder: number;
      id: number;
      parentId: number | null;
    }[]
  ): Promise<void> {
    await this.positionRepository.manager.transaction(async (manager) => {
      for (const node of nodes) {
        await manager.update(Position, node.id, {
          parentId: node.parentId,
          displayOrder: node.displayOrder
        });
      }
    });
  }

  async findActiveDescendants(parentId: number): Promise<Position[]> {
    return this.positionRepository.find({
      where: {
        parentId,
        isActive: true
      }
    });
  }

  async findActiveByIds(ids: number[]): Promise<Position[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.positionRepository.find({
      where: {
        id: In(ids),
        isActive: true
      }
    });
  }

  async countActiveMembersByPositionIds(positionIds: number[]): Promise<number> {
    if (positionIds.length === 0) {
      return 0;
    }

    return this.memberRepository.count({
      where: {
        isActive: true,
        positionId: In(positionIds)
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

  async findDutyByIdAndPositionId(
    id: number,
    positionId: number
  ): Promise<PositionDuty | null> {
    return this.positionDutyRepository.findOne({
      where: {
        id,
        positionId
      }
    });
  }
}
