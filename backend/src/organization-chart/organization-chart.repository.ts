import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Position } from "../position/entity/position.entity";
import { OrganizationChartNodeUpdateRequest } from "./dto/organization-chart-node-update.request";
import { OrganizationChartNode } from "./entity/organization-chart-node.entity";
import { OrganizationChart } from "./entity/organization-chart.entity";

@Injectable()
export class OrganizationChartRepository {
  constructor(
    @InjectRepository(OrganizationChart)
    private readonly chartRepository: Repository<OrganizationChart>,
    @InjectRepository(OrganizationChartNode)
    private readonly nodeRepository: Repository<OrganizationChartNode>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>
  ) {}

  async findActiveChart(): Promise<OrganizationChart | null> {
    return this.chartRepository.findOne({
      where: {
        isActive: true
      },
      order: {
        id: "ASC"
      }
    });
  }

  async findNodesByChartId(chartId: number): Promise<OrganizationChartNode[]> {
    return this.nodeRepository.find({
      relations: {
        member: true,
        organization: true,
        position: true
      },
      where: {
        chartId
      },
      order: {
        floor: "DESC",
        displayOrder: "ASC",
        id: "ASC"
      }
    });
  }

  async createDefaultChartFromPositionTree(): Promise<OrganizationChart> {
    return this.chartRepository.manager.transaction(async (manager) => {
      await manager.update(OrganizationChart, { isActive: true }, { isActive: false });

      const chart = manager.create(OrganizationChart, {
        isActive: true,
        name: "기본 조직도"
      });
      const savedChart = await manager.save(chart);
      const positions = await manager.find(Position, {
        where: {
          isActive: true,
          isLoginVisible: true
        },
        order: {
          displayOrder: "ASC",
          id: "ASC"
        }
      });
      const depthMap = new Map<number, number>();
      const parentMap = new Map<number, number | null>();

      for (const position of positions) {
        parentMap.set(position.id, position.parentId);
      }

      const getDepth = (position: Position): number => {
        if (depthMap.has(position.id)) {
          return depthMap.get(position.id) ?? 0;
        }

        if (position.parentId === null || !parentMap.has(position.parentId)) {
          depthMap.set(position.id, 0);
          return 0;
        }

        const parentPosition = positions.find((item) => item.id === position.parentId);
        const depth = parentPosition ? getDepth(parentPosition) + 1 : 0;
        depthMap.set(position.id, depth);
        return depth;
      };

      const savedNodeMap = new Map<number, OrganizationChartNode>();

      for (const position of positions) {
        const depth = getDepth(position);
        const node = manager.create(OrganizationChartNode, {
          chartId: savedChart.id,
          displayName: position.name,
          displayOrder: position.displayOrder,
          floor: Math.max(3 - depth, 1),
          isEnabled: true,
          parentId: null,
          positionId: position.id,
          slotKey: String(position.id)
        });
        const savedNode = await manager.save(node);
        savedNodeMap.set(position.id, savedNode);
      }

      for (const position of positions) {
        if (position.parentId === null) {
          continue;
        }

        const node = savedNodeMap.get(position.id);
        const parentNode = savedNodeMap.get(position.parentId);
        if (!node || !parentNode) {
          continue;
        }

        node.parentId = parentNode.id;
        node.slotKey = `${parentNode.slotKey}-${position.id}`;
        await manager.save(node);
      }

      return savedChart;
    });
  }

  async saveNodes(chartId: number, nodes: OrganizationChartNodeUpdateRequest[]): Promise<void> {
    await this.nodeRepository.manager.transaction(async (manager) => {
      for (const node of nodes) {
        await manager.update(OrganizationChartNode, { chartId, id: node.id }, {
          displayName: node.displayName?.trim() || null,
          displayOrder: node.displayOrder,
          floor: node.floor,
          imageUrl: node.imageUrl?.trim() || null,
          isEnabled: node.isEnabled,
          memberId: node.memberId ?? null,
          organizationId: node.organizationId ?? null,
          parentId: node.parentId ?? null,
          positionId: node.positionId ?? null,
          slotKey: node.slotKey
        });
      }
    });
  }
}
