import type { LoginResponse } from "@/api/auth";
import type { MemberRole } from "@/types/domain";

export type StoredMember = {
  id: number;
  name: string;
  branch: string | null;
  organizationName?: string | null;
  positionName?: string | null;
  roleType: MemberRole;
};

export type StoredAuth = {
  accessToken: string;
  refreshToken: string;
  currentMember: StoredMember | null;
};

const REMEMBERED_LOGIN_NAME_KEY = "rememberedLoginName";

export function getStoredAuth(): StoredAuth {
  if (typeof window === "undefined") {
    return {
      accessToken: "",
      refreshToken: "",
      currentMember: null
    };
  }

  return {
    accessToken: localStorage.getItem("accessToken") ?? "",
    refreshToken: localStorage.getItem("refreshToken") ?? "",
    currentMember: parseStoredMember(localStorage.getItem("currentMember"))
  };
}

export function saveAuth(response: LoginResponse) {
  localStorage.setItem("accessToken", response.accessToken);
  localStorage.setItem("refreshToken", response.refreshToken);
  localStorage.setItem("currentMember", JSON.stringify(response.member));
}

export function getRememberedLoginName(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(REMEMBERED_LOGIN_NAME_KEY) ?? "";
}

export function saveRememberedLoginName(name: string) {
  localStorage.setItem(REMEMBERED_LOGIN_NAME_KEY, name);
}

export function clearRememberedLoginName() {
  localStorage.removeItem(REMEMBERED_LOGIN_NAME_KEY);
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
