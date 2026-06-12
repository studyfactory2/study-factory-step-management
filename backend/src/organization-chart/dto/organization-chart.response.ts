import { OrganizationChartNode } from "../entity/organization-chart-node.entity";
import { OrganizationChart } from "../entity/organization-chart.entity";

export class OrganizationChartNodeResponse {
  id: number;
  parentId: number | null;
  floor: number;
  slotKey: string;
  displayOrder: number;
  isEnabled: boolean;
  organizationId: number | null;
  organizationName: string | null;
  positionId: number | null;
  positionName: string | null;
  memberId: number | null;
  memberName: string | null;
  imageUrl: string | null;
  displayName: string | null;
  children: OrganizationChartNodeResponse[];

  static from(node: OrganizationChartNode): OrganizationChartNodeResponse {
    return {
      id: node.id,
      parentId: node.parentId,
      floor: node.floor,
      slotKey: node.slotKey,
      displayOrder: node.displayOrder,
      isEnabled: node.isEnabled,
      organizationId: node.organizationId,
      organizationName: node.organization?.name ?? null,
      positionId: node.positionId,
      positionName: node.position?.name ?? null,
      memberId: node.memberId,
      memberName: node.member?.displayName ?? node.member?.name ?? null,
      imageUrl: node.imageUrl ?? node.member?.avatarUrl ?? null,
      displayName: node.displayName,
      children: []
    };
  }
}

export class OrganizationChartResponse {
  id: number;
  name: string;
  isActive: boolean;
  nodes: OrganizationChartNodeResponse[];

  static from(chart: OrganizationChart, nodes: OrganizationChartNode[]): OrganizationChartResponse {
    return {
      id: chart.id,
      name: chart.name,
      isActive: chart.isActive,
      nodes: buildNodeTree(nodes)
    };
  }
}

function buildNodeTree(nodes: OrganizationChartNode[]) {
  const nodeMap = new Map<number, OrganizationChartNodeResponse>();
  const roots: OrganizationChartNodeResponse[] = [];

  for (const node of nodes) {
    nodeMap.set(node.id, OrganizationChartNodeResponse.from(node));
  }

  for (const node of nodes) {
    const responseNode = nodeMap.get(node.id);
    if (!responseNode) {
      continue;
    }

    if (node.parentId === null) {
      roots.push(responseNode);
      continue;
    }

    const parent = nodeMap.get(node.parentId);
    if (!parent) {
      roots.push(responseNode);
      continue;
    }

    parent.children.push(responseNode);
  }

  const sortNodes = (items: OrganizationChartNodeResponse[]) => {
    items.sort((left, right) => left.displayOrder - right.displayOrder || left.id - right.id);
    items.forEach((item) => sortNodes(item.children));
  };

  sortNodes(roots);

  return roots;
}
