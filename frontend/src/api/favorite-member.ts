import type { AdminDashboardEmployee } from "@/api/admin";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiErrorResponse = {
  message?: string | string[];
};

function getErrorMessage(error: ApiErrorResponse | null, fallbackMessage: string) {
  return Array.isArray(error?.message) ? error.message[0] : error?.message ?? fallbackMessage;
}

export async function addFavoriteMember(
  accessToken: string,
  memberId: number
): Promise<AdminDashboardEmployee[]> {
  const response = await fetch(`${API_BASE_URL}/api/favorite-members`, {
    body: JSON.stringify({ memberId }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;

    throw new Error(getErrorMessage(error, "함께 프로젝트 중 직원을 추가하지 못했습니다."));
  }

  return response.json() as Promise<AdminDashboardEmployee[]>;
}

export async function deleteFavoriteMember(
  accessToken: string,
  memberId: number
): Promise<AdminDashboardEmployee[]> {
  const response = await fetch(`${API_BASE_URL}/api/favorite-members/${memberId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    method: "DELETE"
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;

    throw new Error(getErrorMessage(error, "함께 프로젝트 중 직원을 삭제하지 못했습니다."));
  }

  return response.json() as Promise<AdminDashboardEmployee[]>;
}

export async function getFavoriteMemberCandidates(
  accessToken: string
): Promise<AdminDashboardEmployee[]> {
  const response = await fetch(`${API_BASE_URL}/api/favorite-members/candidates`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;

    throw new Error(getErrorMessage(error, "직원 후보 목록을 불러오지 못했습니다."));
  }

  return response.json() as Promise<AdminDashboardEmployee[]>;
}
