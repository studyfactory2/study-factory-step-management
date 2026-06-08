import { Injectable } from "@nestjs/common";
import { PositionResponse, PositionTreeResponse } from "./dto/position.response";
import { PositionRepository } from "./position.repository";

@Injectable()
export class PositionService {
  constructor(private readonly positionRepository: PositionRepository) {}

  async findAll(): Promise<PositionResponse[]> {
    const positions = await this.positionRepository.findActivePositions();
    return positions.map(PositionResponse.from);
  }

  async findTree(): Promise<PositionTreeResponse[]> {
    const positions = await this.positionRepository.findActivePositions();
    const positionMap = new Map<number, PositionTreeResponse>();
    const roots: PositionTreeResponse[] = [];

    for (const position of positions) {
      positionMap.set(position.id, PositionTreeResponse.fromPosition(position));
    }

    for (const position of positions) {
      const node = positionMap.get(position.id);
      if (!node) {
        continue;
      }

      if (position.parentId === null) {
        roots.push(node);
        continue;
      }

      const parent = positionMap.get(position.parentId);
      if (!parent) {
        roots.push(node);
        continue;
      }

      parent.children.push(node);
    }

    return roots;
  }
}
