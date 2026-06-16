import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import {
  LOGIN_STRUCTURE_CACHE_KEY_LIST,
  LOGIN_STRUCTURE_CACHE_KEYS,
  LOGIN_STRUCTURE_CACHE_TTL_SECONDS
} from "../cache/login-structure-cache";
import { RedisCacheService } from "../cache/redis-cache.service";
import { PositionCreateRequest } from "./dto/position-create.request";
import { PositionResponse, PositionTreeResponse } from "./dto/position.response";
import { PositionTreeUpdateRequest } from "./dto/position-tree-update.request";
import { PositionUpdateRequest } from "./dto/position-update.request";
import { PositionDuty } from "./entity/position-duty.entity";
import { Position } from "./entity/position.entity";
import { PositionRepository } from "./position.repository";

@Injectable()
export class PositionService {
  constructor(
    private readonly positionRepository: PositionRepository,
    private readonly cacheService: RedisCacheService
  ) {}

  async findAll(): Promise<PositionResponse[]> {
    const positions = await this.positionRepository.findActivePositions();
    return positions.map(PositionResponse.from);
  }

  async findTree(): Promise<PositionTreeResponse[]> {
    const cachedTree = await this.cacheService.getJson<PositionTreeResponse[]>(
      LOGIN_STRUCTURE_CACHE_KEYS.positionTree
    );
    if (cachedTree) {
      return cachedTree;
    }

    const tree = await this.buildTree();
    await this.cacheService.setJson(
      LOGIN_STRUCTURE_CACHE_KEYS.positionTree,
      tree,
      LOGIN_STRUCTURE_CACHE_TTL_SECONDS
    );

    return tree;
  }

  private async buildTree(): Promise<PositionTreeResponse[]> {
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

  async create(request: PositionCreateRequest): Promise<PositionResponse> {
    const position = new Position();
    position.name = request.name.trim();
    position.subtitle = request.subtitle?.trim() || null;
    position.parentId = request.parentId ?? null;
    position.displayOrder = 0;
    position.isLoginVisible = request.isLoginVisible ?? true;
    position.isAdmin = request.isAdmin ?? false;
    position.isActive = true;

    const savedPosition = await this.positionRepository.save(position);

    if (request.duty?.trim()) {
      const positionDuty = new PositionDuty();
      positionDuty.positionId = savedPosition.id;
      positionDuty.duty = null;
      positionDuty.name = request.duty.trim();
      const savedDuty = await this.positionRepository.saveDuty(positionDuty);
      savedPosition.dutyLinks = [savedDuty];
    } else {
      savedPosition.dutyLinks = [];
    }

    await this.clearLoginStructureCache();

    return PositionResponse.from(savedPosition);
  }

  async updateTree(request: PositionTreeUpdateRequest): Promise<PositionTreeResponse[]> {
    const currentPositions = await this.positionRepository.findActiveByIds(
      request.positions.map((position) => position.id)
    );
    const currentPositionMap = new Map(currentPositions.map((position) => [position.id, position]));
    const hasAdminParentChange = request.positions.some((position) => {
      const currentPosition = currentPositionMap.get(position.id);

      return currentPosition?.isAdmin && currentPosition.parentId !== (position.parentId ?? null);
    });

    if (hasAdminParentChange) {
      throw new ConflictException("관리자는 직위를 설정할 수 없습니다.");
    }

    await this.positionRepository.updateTreeNodes(
      request.positions.map((position) => ({
        id: position.id,
        parentId: position.parentId ?? null,
        displayOrder: position.displayOrder
      }))
    );

    await this.clearLoginStructureCache();

    return this.findTree();
  }

  async update(id: number, request: PositionUpdateRequest): Promise<PositionResponse> {
    const position = await this.positionRepository.findActiveById(id);
    if (!position) {
      throw new NotFoundException("직위 정보를 찾을 수 없습니다.");
    }

    if (request.name?.trim()) {
      position.name = request.name.trim();
    }

    const savedPosition = await this.positionRepository.save(position);

    await this.clearLoginStructureCache();

    return PositionResponse.from(savedPosition);
  }

  async delete(id: number): Promise<void> {
    const position = await this.positionRepository.findActiveById(id);
    if (!position) {
      throw new NotFoundException("직위 정보를 찾을 수 없습니다.");
    }

    const positionIds = await this.findPositionTreeIds(id);
    const memberCount = await this.positionRepository.countMembersByPositionIds(positionIds);
    if (memberCount > 0) {
      throw new ConflictException("해당 직위를 사용하는 직원이 있어 삭제할 수 없습니다.");
    }

    const preRegistrationCount = await this.positionRepository.countPreRegistrationsByPositionIds(positionIds);
    if (preRegistrationCount > 0) {
      throw new ConflictException("해당 직위를 사용하는 사전등록 정보가 있어 삭제할 수 없습니다.");
    }

    await this.deletePositionTree(id);
    await this.clearLoginStructureCache();
  }

  private async findPositionTreeIds(id: number): Promise<number[]> {
    const children = await this.positionRepository.findDescendants(id);
    const childIds = await Promise.all(children.map((child) => this.findPositionTreeIds(child.id)));

    return [id, ...childIds.flat()];
  }

  private async deletePositionTree(id: number): Promise<void> {
    const children = await this.positionRepository.findDescendants(id);

    for (const child of children) {
      await this.deletePositionTree(child.id);
    }

    await this.positionRepository.deleteById(id);
  }

  private async clearLoginStructureCache(): Promise<void> {
    await this.cacheService.delete(LOGIN_STRUCTURE_CACHE_KEY_LIST);
  }
}
