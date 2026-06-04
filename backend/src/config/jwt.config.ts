export const jwtConfig = () => ({
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY ?? "",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "14d"
  }
});
