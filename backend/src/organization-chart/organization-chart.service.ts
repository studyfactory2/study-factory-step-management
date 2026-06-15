import { Injectable } from "@nestjs/common";
import { OrganizationChartUpdateRequest } from "./dto/organization-chart-update.request";
import { OrganizationChartResponse } from "./dto/organization-chart.response";
import { OrganizationChartRepository } from "./organization-chart.repository";

@Injectable()
export class OrganizationChartService {
  constructor(private readonly organizationChartRepository: OrganizationChartRepository) {}

  async findActive(): Promise<OrganizationChartResponse> {
    const chart = await this.findOrCreateActiveChart();
    const nodes = await this.organizationChartRepository.findNodesByChartId(chart.id);

    return OrganizationChartResponse.from(chart, nodes);
  }

  async resetFromPositionTree(): Promise<OrganizationChartResponse> {
    const chart = await this.organizationChartRepository.createDefaultChartFromPositionTree();
    const nodes = await this.organizationChartRepository.findNodesByChartId(chart.id);

    return OrganizationChartResponse.from(chart, nodes);
  }

  async updateActive(request: OrganizationChartUpdateRequest): Promise<OrganizationChartResponse> {
    const chart = await this.findOrCreateActiveChart();
    await this.organizationChartRepository.saveNodes(chart.id, request.nodes);

    const nodes = await this.organizationChartRepository.findNodesByChartId(chart.id);
    return OrganizationChartResponse.from(chart, nodes);
  }

  private async findOrCreateActiveChart() {
    const chart = await this.organizationChartRepository.findActiveChart();
    if (chart) {
      return chart;
    }

    return this.organizationChartRepository.createDefaultChartFromPositionTree();
  }
}
