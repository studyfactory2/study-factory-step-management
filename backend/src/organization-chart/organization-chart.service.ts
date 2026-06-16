import { Injectable } from "@nestjs/common";
import {
  LOGIN_STRUCTURE_CACHE_KEY_LIST,
  LOGIN_STRUCTURE_CACHE_KEYS,
  LOGIN_STRUCTURE_CACHE_TTL_SECONDS
} from "../cache/login-structure-cache";
import { RedisCacheService } from "../cache/redis-cache.service";
import { OrganizationChartUpdateRequest } from "./dto/organization-chart-update.request";
import { OrganizationChartResponse } from "./dto/organization-chart.response";
import { OrganizationChartRepository } from "./organization-chart.repository";

@Injectable()
export class OrganizationChartService {
  constructor(
    private readonly organizationChartRepository: OrganizationChartRepository,
    private readonly cacheService: RedisCacheService
  ) {}

  async findActive(): Promise<OrganizationChartResponse> {
    const cachedChart = await this.cacheService.getJson<OrganizationChartResponse>(
      LOGIN_STRUCTURE_CACHE_KEYS.activeOrganizationChart
    );
    if (cachedChart) {
      return cachedChart;
    }

    const chart = await this.findOrCreateActiveChart();
    const nodes = await this.organizationChartRepository.findNodesByChartId(chart.id);

    const response = OrganizationChartResponse.from(chart, nodes);
    await this.cacheService.setJson(
      LOGIN_STRUCTURE_CACHE_KEYS.activeOrganizationChart,
      response,
      LOGIN_STRUCTURE_CACHE_TTL_SECONDS
    );

    return response;
  }

  async resetFromPositionTree(): Promise<OrganizationChartResponse> {
    const chart = await this.organizationChartRepository.createDefaultChartFromPositionTree();
    const nodes = await this.organizationChartRepository.findNodesByChartId(chart.id);

    const response = OrganizationChartResponse.from(chart, nodes);
    await this.cacheService.delete(LOGIN_STRUCTURE_CACHE_KEY_LIST);

    return response;
  }

  async updateActive(request: OrganizationChartUpdateRequest): Promise<OrganizationChartResponse> {
    const chart = await this.findOrCreateActiveChart();
    await this.organizationChartRepository.saveNodes(chart.id, request.nodes);

    const nodes = await this.organizationChartRepository.findNodesByChartId(chart.id);
    const response = OrganizationChartResponse.from(chart, nodes);
    await this.cacheService.delete([LOGIN_STRUCTURE_CACHE_KEYS.activeOrganizationChart]);

    return response;
  }

  private async findOrCreateActiveChart() {
    const chart = await this.organizationChartRepository.findActiveChart();
    if (chart) {
      return chart;
    }

    return this.organizationChartRepository.createDefaultChartFromPositionTree();
  }
}
