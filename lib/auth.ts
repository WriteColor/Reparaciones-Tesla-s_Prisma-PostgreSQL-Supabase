"use server"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { AUTH_CONSTANTS } from "@/lib/constants"
import crypto from "crypto"

export type User = {
  id: number
  username: string
}

export async function generateToken(length = 40): Promise<string> {
  return crypto.randomBytes(length).toString("hex")
}

export async function getCurrentTimestamp(): Promise<number> {
  return Math.floor(Date.now() / 1000)
}

export async function verifyCredentials(username: string, password: string): Promise<User | null> {
  try {
    const user = await prisma.users.findFirst({
      where: { username, password },
      select: { id: true, username: true },
    })
    return user ?? null
  } catch (error) {
    console.error("Error al verificar credenciales:", error)
    return null
  }
}

export async function getClientInfo() {
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for') ||
    headersList.get('x-real-ip') ||
    headersList.get('cf-connecting-ip') ||
    headersList.get('x-client-ip') ||
    '127.0.0.1'
  const userAgent = headersList.get('user-agent') || 'Unknown'
  const cleanIp = ip.split(',')[0].trim()
  return { ip: cleanIp, userAgent }
}

export async function createSession(user: User, ip: string, userAgent: string): Promise<string> {
  try {
    const sessionId = await generateToken()
    const timestamp = await getCurrentTimestamp()
    const expiresAt = timestamp + AUTH_CONSTANTS.SESSION_DURATION

    await prisma.sessions.create({
      data: {
        id: sessionId,
        user_id: user.id,
        ip_address: ip,
        user_agent: userAgent,
        payload: JSON.stringify({
          user_id: user.id,
          last_activity: timestamp,
          expires_at: expiresAt,
          ip,
        }),
        last_activity: timestamp,
        expires_at: expiresAt,
      },
    })

    return sessionId
  } catch (error) {
    console.error("Error al crear sesión:", error)
    throw new Error("No se pudo crear la sesión")
  }
}

export async function createRememberToken(userId: number): Promise<string> {
  try {
    const token = await generateToken()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + AUTH_CONSTANTS.REMEMBER_TOKEN_DURATION * 1000)

    await prisma.remember_tokens.create({
      data: {
        user_id: userId,
        token,
        created_at: now,
        expires_at: expiresAt,
      },
    })

    return token
  } catch (error) {
    console.error("Error al crear token de recordar:", error)
    throw new Error("No se pudo crear el token de recordar")
  }
}

export async function verifyRememberToken(token: string): Promise<User | null> {
  try {
    const record = await prisma.remember_tokens.findFirst({
      where: {
        token,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        users: true, // Esto incluye la relación con el modelo 'users'
      },
    })

    return record?.users ? { id: record.users.id, username: record.users.username } : null
  } catch (error) {
    console.error("Error al verificar token de recordar:", error)
    return null
  }
}

export async function verifySession(sessionId: string): Promise<User | null> {
  try {
    const now = await getCurrentTimestamp()

    const session = await prisma.sessions.findFirst({
      where: {
        id: sessionId,
        expires_at: {
          gt: now,
        },
      },
      include: {
        users: true, // Incluye la relación con el modelo 'users'
      },
    })

    if (!session) return null

    const newExpiresAt = now + AUTH_CONSTANTS.SESSION_DURATION

    await prisma.sessions.update({
      where: { id: sessionId },
      data: {
        last_activity: now,
        expires_at: newExpiresAt,
      },
    })

    return session.users ? { id: session.users.id, username: session.users.username } : null
  } catch (error) {
    console.error("Error al verificar sesión:", error)
    return null
  }
}

export async function logout(sessionId?: string, rememberToken?: string): Promise<void> {
  try {
    if (sessionId) {
      await prisma.sessions.deleteMany({ where: { id: sessionId } })
    }

    if (rememberToken) {
      await prisma.remember_tokens.deleteMany({ where: { token: rememberToken } })
    }

    const cookieStore = await cookies()
    cookieStore.delete("session_id")
    cookieStore.delete("remember_token")
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
  }
}

export async function cleanExpiredSessions() {
  try {
    const now = await getCurrentTimestamp()

    await prisma.sessions.deleteMany({
      where: {
        expires_at: {
          lt: now,
        },
      },
    })

    await prisma.remember_tokens.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    })
  } catch (error) {
    console.error("Error al limpiar sesiones expiradas:", error)
  }
}

export async function requireAuth(isLoginPage: boolean = false) {
  await cleanExpiredSessions()

  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value
  const rememberToken = cookieStore.get("remember_token")?.value
  const { ip, userAgent } = await getClientInfo()

  let user: User | null = null

  if (sessionId) {
    user = await verifySession(sessionId)
  }

  if (!user && rememberToken) {
    user = await verifyRememberToken(rememberToken)
    if (user) {
      const newSessionId = await createSession(user, ip, userAgent)
      cookieStore.set("session_id", newSessionId, {
        ...AUTH_CONSTANTS.COOKIE_OPTIONS,
        maxAge: AUTH_CONSTANTS.SESSION_DURATION,
      })
    }
  }

  if (user && isLoginPage) {
    redirect("/dashboard/add-order")
  }

  if (!user && !isLoginPage) {
    redirect("/")
  }

  return user
}
