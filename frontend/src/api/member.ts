import type { Member } from "@/types/domain";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export async function getMembers(): Promise<Member[]> {
  const response = await fetch(`${API_BASE_URL}/api/members`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("직원 목록을 불러오지 못했습니다.");
  }

  return response.json() as Promise<Member[]>;
}
