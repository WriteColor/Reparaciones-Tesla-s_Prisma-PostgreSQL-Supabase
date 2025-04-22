import { PrismaClient } from "@prisma/client"

// Esta variable global previene crear múltiples instancias de Prisma en desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Exporta una instancia única de Prisma
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

/**
 * Ejecuta cualquier consulta Prisma de forma segura.
 * 
 * @param query Función async que recibe el cliente Prisma y devuelve el resultado.
 * @returns Resultado de la consulta.
 */
export async function runQuery<T>(query: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await query(prisma)
  } catch (error) {
    console.error("Error al ejecutar la consulta Prisma:", error)
    throw error
  }
}
