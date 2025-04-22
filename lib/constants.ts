export const AUTH_CONSTANTS = {
  SESSION_DURATION: 60 * 60,
  REMEMBER_TOKEN_DURATION: 60 * 60,

  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax" as const
  }
} as const