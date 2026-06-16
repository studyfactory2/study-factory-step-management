export const REFRESH_TOKEN_CACHE_KEYS = {
  memberToken: (memberId: number) => `auth:refresh-token:member:${memberId}`,
  tokenMember: (token: string) => `auth:refresh-token:value:${token}`
} as const;
