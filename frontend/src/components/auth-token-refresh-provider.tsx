"use client";

import { useEffect } from "react";
import { refreshAuth } from "@/api/auth";
import { clearAuth, saveAuth } from "@/lib/auth-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

function isApiRequest(input: RequestInfo | URL) {
  const url = typeof input === "string"
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;

  return url.startsWith(API_BASE_URL);
}

function isRefreshRequest(input: RequestInfo | URL) {
  const url = typeof input === "string"
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;

  return url.includes("/api/auth/refresh");
}

function hasAuthorizationHeader(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));

  return headers.has("Authorization");
}

function buildRetryInit(input: RequestInfo | URL, init: RequestInit | undefined, accessToken: string): RequestInit {
  const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  headers.set("Authorization", `Bearer ${accessToken}`);

  return {
    ...init,
    headers
  };
}

export function AuthTokenRefreshProvider() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    let refreshPromise: Promise<string> | null = null;

    async function refreshAccessToken() {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const refreshToken = localStorage.getItem("refreshToken");

          if (!refreshToken) {
            throw new Error("리프레시 토큰이 없습니다.");
          }

          const response = await refreshAuth(refreshToken);
          saveAuth(response);

          return response.accessToken;
        })().finally(() => {
          refreshPromise = null;
        });
      }

      return refreshPromise;
    }

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await originalFetch(input, init);

      if (
        response.status !== 401
        || !isApiRequest(input)
        || isRefreshRequest(input)
        || !hasAuthorizationHeader(input, init)
      ) {
        return response;
      }

      try {
        const nextAccessToken = await refreshAccessToken();

        return originalFetch(input, buildRetryInit(input, init, nextAccessToken));
      } catch {
        clearAuth();
        window.location.replace("/");

        return response;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
