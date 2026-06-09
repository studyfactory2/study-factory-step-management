import type { LoginResponse } from "@/api/auth";
import type { MemberRole } from "@/types/domain";

export type StoredMember = {
  id: number;
  name: string;
  branch: string | null;
  roleType: MemberRole;
};

export type StoredAuth = {
  accessToken: string;
  currentMember: StoredMember | null;
};

export function getStoredAuth(): StoredAuth {
  if (typeof window === "undefined") {
    return {
      accessToken: "",
      currentMember: null
    };
  }

  return {
    accessToken: localStorage.getItem("accessToken") ?? "",
    currentMember: parseStoredMember(localStorage.getItem("currentMember"))
  };
}

export function saveAuth(response: LoginResponse) {
  localStorage.setItem("accessToken", response.accessToken);
  localStorage.setItem("refreshToken", response.refreshToken);
  localStorage.setItem("currentMember", JSON.stringify(response.member));
}

export function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentMember");
}

export function isAdminRole(roleType: MemberRole) {
  return roleType === "ADMIN" || roleType === "CEO";
}

function parseStoredMember(value: string | null): StoredMember | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredMember;
  } catch {
    return null;
  }
}
