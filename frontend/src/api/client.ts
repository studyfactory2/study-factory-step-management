import { clearAuth } from "@/lib/auth-storage";

export function handleUnauthorizedResponse(response: Response) {
  if (response.status !== 401) {
    return;
  }

  clearAuth();

  if (typeof window !== "undefined") {
    window.location.replace("/");
  }
}
