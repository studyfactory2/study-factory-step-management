const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiErrorResponse = {
  message?: string | string[];
};

function getErrorMessage(error: ApiErrorResponse | null, fallbackMessage: string) {
  return Array.isArray(error?.message) ? error.message[0] : error?.message ?? fallbackMessage;
}

export type PositionTreeNode = {
  id: number;
  name: string;
  organizationName?: string | null;
  subtitle: string | null;
  duties: string[];
  dutyOptions: {
    id: number;
    name: string;
  }[];
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
    throw new Error("로그인 화면 조직도를 불러오지 못했습니다.");
  }

  return response.json() as Promise<PositionTreeNode[]>;
}

export type PositionCreateRequest = {
  name: string;
  subtitle?: string;
  duty?: string;
  parentId?: number | null;
  isLoginVisible?: boolean;
  isAdmin?: boolean;
};

export type PositionTreeUpdateRequest = {
  positions: {
    id: number;
    parentId: number | null;
    displayOrder: number;
  }[];
};

export async function createPosition(
  accessToken: string,
  request: PositionCreateRequest
): Promise<PositionTreeNode> {
  const response = await fetch(`${API_BASE_URL}/api/positions`, {
    body: JSON.stringify(request),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;

    throw new Error(getErrorMessage(error, "직위를 추가하지 못했습니다."));
  }

  return response.json() as Promise<PositionTreeNode>;
}

export async function updatePositionTree(
  accessToken: string,
  request: PositionTreeUpdateRequest
): Promise<PositionTreeNode[]> {
  const response = await fetch(`${API_BASE_URL}/api/positions/tree`, {
    body: JSON.stringify(request),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    method: "PATCH"
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;

    throw new Error(getErrorMessage(error, "로그인 화면 조직도를 저장하지 못했습니다."));
  }

  return response.json() as Promise<PositionTreeNode[]>;
}

export async function deletePosition(accessToken: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/positions/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    method: "DELETE"
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;

    throw new Error(getErrorMessage(error, "직위를 삭제하지 못했습니다."));
  }
}
