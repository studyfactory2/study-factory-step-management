import type { Member, MemberAffiliation, MemberDuty, MemberPosition } from "@/types/domain";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type MemberPreRegisterRequest = {
  affiliation: MemberAffiliation;
  branch: string;
  duty: MemberDuty;
  name: string;
  position: MemberPosition;
};

export type MemberPreRegistration = {
  id: number;
  affiliation: MemberAffiliation;
  branch: string;
  createdAt: string;
  duty: MemberDuty;
  isRegistered: boolean;
  name: string;
  position: MemberPosition;
  updatedAt: string;
};

export async function getMembers(): Promise<Member[]> {
  const response = await fetch(`${API_BASE_URL}/api/members`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("직원 목록을 불러오지 못했습니다.");
  }

  return response.json() as Promise<Member[]>;
}

export async function preRegisterMember(
  accessToken: string,
  request: MemberPreRegisterRequest
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/members/pre-registrations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "직원 사전등록에 실패했습니다.");
  }
}

export async function getMemberPreRegistrations(accessToken: string): Promise<MemberPreRegistration[]> {
  const response = await fetch(`${API_BASE_URL}/api/members/pre-registrations`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "직원 사전등록 목록을 불러오지 못했습니다.");
  }

  return response.json() as Promise<MemberPreRegistration[]>;
}

export async function deleteMemberPreRegistration(accessToken: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/members/pre-registrations/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "직원 사전등록 정보를 삭제하지 못했습니다.");
  }
}
