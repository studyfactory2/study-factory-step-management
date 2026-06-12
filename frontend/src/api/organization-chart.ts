import { handleUnauthorizedResponse } from "@/api/client";
import type { PositionTreeNode } from "@/api/position";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type OrganizationChartNode = {
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
  children: OrganizationChartNode[];
};

export type OrganizationChart = {
  id: number;
  name: string;
  isActive: boolean;
  nodes: OrganizationChartNode[];
};

export type OrganizationChartNodeUpdate = Omit<OrganizationChartNode, "children" | "memberName" | "organizationName" | "positionName">;

export async function getActiveOrganizationChart(): Promise<OrganizationChart> {
  const response = await fetch(`${API_BASE_URL}/api/organization-chart/active`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("조직도를 불러오지 못했습니다.");
  }

  return response.json() as Promise<OrganizationChart>;
}

export async function resetOrganizationChartFromPositionTree(accessToken: string): Promise<OrganizationChart> {
  const response = await fetch(`${API_BASE_URL}/api/organization-chart/active/reset-from-position-tree`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    method: "POST"
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    throw new Error("직위트리로 조직도를 초기화하지 못했습니다.");
  }

  return response.json() as Promise<OrganizationChart>;
}

export async function updateActiveOrganizationChart(
  accessToken: string,
  nodes: OrganizationChartNodeUpdate[]
): Promise<OrganizationChart> {
  const response = await fetch(`${API_BASE_URL}/api/organization-chart/active`, {
    body: JSON.stringify({ nodes }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    method: "PATCH"
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    throw new Error("조직도를 저장하지 못했습니다.");
  }

  return response.json() as Promise<OrganizationChart>;
}

export function organizationChartNodesToPositionTree(nodes: OrganizationChartNode[]): PositionTreeNode[] {
  return nodes
    .filter((node) => node.isEnabled)
    .map((node) => ({
      children: organizationChartNodesToPositionTree(node.children ?? []),
      displayOrder: node.displayOrder,
      duties: [],
      dutyOptions: [],
      id: node.positionId ?? node.id,
      isActive: node.isEnabled,
      isAdmin: false,
      isLoginVisible: true,
      name: node.displayName ?? node.positionName ?? node.memberName ?? "미지정",
      parentId: node.parentId,
      subtitle: node.memberName ?? node.organizationName
    }));
}
