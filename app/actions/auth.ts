"use server"

import { cookies } from "next/headers"
import {
  verifyCredentials,
  createSession,
  createRememberToken,
  getClientInfo,
} from "@/lib/auth"
import { prisma } from "@/lib/db"
import { AUTH_CONSTANTS } from "@/lib/constants"

type LoginResult = {
  success: boolean
  error?: string
}

export async function login(username: string, password: string, remember: boolean): Promise<LoginResult> {
  try {
    const user = await verifyCredentials(username, password)
    if (!user) {
      return { success: false, error: "Nombre de usuario o contraseña incorrectos" }
    }

    const { ip, userAgent } = await getClientInfo()
    const sessionId = await createSession(user, ip, userAgent)

    const cookieStore = await cookies()
    cookieStore.set("session_id", sessionId, {
      ...AUTH_CONSTANTS.COOKIE_OPTIONS,
      maxAge: AUTH_CONSTANTS.SESSION_DURATION,
    })

    if (remember) {
      const rememberToken = await createRememberToken(user.id)
      cookieStore.set("remember_token", rememberToken, {
        ...AUTH_CONSTANTS.COOKIE_OPTIONS,
        maxAge: AUTH_CONSTANTS.REMEMBER_TOKEN_DURATION,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error)
    return { success: false, error: "Ocurrió un error durante el inicio de sesión" }
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value
    const rememberToken = cookieStore.get("remember_token")?.value

    if (sessionId) {
      await prisma.sessions.deleteMany({
        where: {
          OR: [
            { id: sessionId },
            { expires_at: { lt: Math.floor(Date.now() / 1000) } },
          ],
        },
      })
    }

    if (rememberToken) {
      await prisma.remember_tokens.deleteMany({
        where: {
          OR: [
            { token: rememberToken },
            { expires_at: { lt: new Date() } },
          ],
        },
      })
    }

    cookieStore.set("session_id", "", {
      expires: new Date(0),
      path: "/",
    })
    cookieStore.set("remember_token", "", {
      expires: new Date(0),
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Error durante el cierre de sesión:", error)
    return { success: false, error: "Ocurrió un error durante el cierre de sesión" }
  }
}
