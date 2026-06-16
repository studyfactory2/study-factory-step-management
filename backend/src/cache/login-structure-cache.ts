export const LOGIN_STRUCTURE_CACHE_TTL_SECONDS = 60 * 30;

export const LOGIN_STRUCTURE_CACHE_KEYS = {
  activeOrganizationChart: "login-structure:organization-chart:active",
  positionTree: "login-structure:positions:tree"
} as const;

export const LOGIN_STRUCTURE_CACHE_KEY_LIST = Object.values(LOGIN_STRUCTURE_CACHE_KEYS);
