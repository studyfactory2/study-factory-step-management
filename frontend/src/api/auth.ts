import type { MemberRole } from "@/types/domain";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type LoginRequest = {
  name: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  member: {
    id: number;
    name: string;
    branch: string | null;
    organizationName?: string | null;
    positionName?: string | null;
    roleType: MemberRole;
  };
};

type ApiErrorResponse = {
  message?: string | string[];
};

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "로그인에 실패했습니다.");
  }

  return response.json() as Promise<LoginResponse>;
}

export async function refreshAuth(refreshToken: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "로그인 갱신에 실패했습니다.");
  }

  return response.json() as Promise<LoginResponse>;
}
