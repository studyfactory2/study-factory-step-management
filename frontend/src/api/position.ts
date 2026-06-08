const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type PositionTreeNode = {
  id: number;
  code: string;
  name: string;
  subtitle: string | null;
  parentId: number | null;
  displayOrder: number;
  isLoginVisible: boolean;
  isAdmin: boolean;
  isActive: boolean;
  children: PositionTreeNode[];
};

export async function getPositionTree(): Promise<PositionTreeNode[]> {
  const response = await fetch(`${API_BASE_URL}/api/positions/tree`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("직위트리를 불러오지 못했습니다.");
  }

  return response.json() as Promise<PositionTreeNode[]>;
}
