import type { Member, MemberAffiliation, MemberDuty, MemberPosition } from "@/types/domain";
import { handleUnauthorizedResponse } from "@/api/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type MemberPreRegisterRequest = {
  dutyText: string;
  joinedAt: string;
  name: string;
  organization: string;
  positionDutyId?: number;
  positionId: number;
};

export type MemberRegisterRequest = {
  avatar?: File;
  birthDate: string;
  name: string;
  organization: string;
  password: string;
  phoneNumber: string;
  positionId: number;
  residenceCity: string;
  residenceDistrict: string;
};

export type MemberPreRegistration = {
  id: number;
  affiliation: MemberAffiliation | null;
  branch: string | null;
  createdAt: string;
  duty: MemberDuty | null;
  dutyText: string | null;
  isRegistered: boolean;
  joinedAt: string | null;
  name: string;
  organization?: {
    id: number;
    name: string;
  } | null;
  organizationId: number | null;
  phoneNumber: string | null;
  position: MemberPosition | null;
  positionDutyId: number | null;
  positionDuty?: {
    id: number;
    name: string | null;
    duty: MemberDuty | null;
  } | null;
  positionId: number | null;
  residenceCity: string | null;
  residenceDistrict: string | null;
  positionInfo?: {
    id: number;
    name: string;
  } | null;
  updatedAt: string;
};

export type OrganizationOption = {
  colorIndex?: number | null;
  displayOrder?: number;
  id: number;
  name: string;
};

export type OrganizationUpdateRequest = {
  organizations: {
    colorIndex?: number | null;
    displayOrder: number;
    id?: number;
    name: string;
  }[];
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

export async function getMemberBranches(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/members/branches`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("지점 목록을 불러오지 못했습니다.");
  }

  return response.json() as Promise<string[]>;
}

export async function getOrganizations(): Promise<OrganizationOption[]> {
  const response = await fetch(`${API_BASE_URL}/api/members/organizations`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("소속 목록을 불러오지 못했습니다.");
  }

  return response.json() as Promise<OrganizationOption[]>;
}

export async function updateOrganizations(
  accessToken: string,
  request: OrganizationUpdateRequest
): Promise<OrganizationOption[]> {
  const response = await fetch(`${API_BASE_URL}/api/members/organizations`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "부서 정보를 저장하지 못했습니다.");
  }

  return response.json() as Promise<OrganizationOption[]>;
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
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "직원 사전등록에 실패했습니다.");
  }
}

export async function updateMemberPreRegistration(
  accessToken: string,
  id: number,
  request: MemberPreRegisterRequest
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/members/pre-registrations/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "직원 사전등록 정보를 수정하지 못했습니다.");
  }
}

export async function registerMember(request: MemberRegisterRequest): Promise<Member> {
  const formData = new FormData();
  formData.append("name", request.name);
  formData.append("organization", request.organization);
  formData.append("password", request.password);
  formData.append("birthDate", request.birthDate);
  formData.append("phoneNumber", request.phoneNumber);
  formData.append("positionId", String(request.positionId));
  formData.append("residenceCity", request.residenceCity);
  formData.append("residenceDistrict", request.residenceDistrict);

  if (request.avatar) {
    formData.append("avatar", request.avatar);
  }

  const response = await fetch(`${API_BASE_URL}/api/members/register`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "직원 등록에 실패했습니다.");
  }

  return response.json() as Promise<Member>;
}

export async function getMemberPreRegistrations(accessToken: string): Promise<MemberPreRegistration[]> {
  const response = await fetch(`${API_BASE_URL}/api/members/pre-registrations`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    handleUnauthorizedResponse(response);
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
    handleUnauthorizedResponse(response);
    const error = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;

    throw new Error(message ?? "직원 사전등록 정보를 삭제하지 못했습니다.");
  }
}
