import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Position } from "./entity/position.entity";

@Injectable()
export class PositionRepository {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>
  ) {}

  async findActivePositions(): Promise<Position[]> {
    return this.positionRepository.find({
      where: {
        isActive: true
      },
      order: {
        displayOrder: "ASC",
        id: "ASC"
      }
    });
  }
}
