// scripts/showAllData.ts
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const ordenes = await prisma.ordenesdetrabajo.findMany({ include: { imagenes_ordenes: true } })
  const imagenes = await prisma.imagenes_ordenes.findMany()
  const marcas = await prisma.marcas.findMany()
  const tipos = await prisma.tiposdeequipo.findMany()
  const usuarios = await prisma.users.findMany({ include: { sessions: true, remember_tokens: true } })
  const sesiones = await prisma.sessions.findMany()
  const tokens = await prisma.remember_tokens.findMany()

  console.log("\n📦 Ordenes de Trabajo:")
  console.dir(ordenes, { depth: null })

  console.log("\n🖼️ Imágenes Ordenes:")
  console.dir(imagenes, { depth: null })

  console.log("\n🏷️ Marcas:")
  console.dir(marcas, { depth: null })

  console.log("\n📱 Tipos de equipo:")
  console.dir(tipos, { depth: null })

  console.log("\n👤 Usuarios:")
  console.dir(usuarios, { depth: null })

  console.log("\n🔐 Tokens:")
  console.dir(tokens, { depth: null })

  console.log("\n🌐 Sesiones:")
  console.dir(sesiones, { depth: null })

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error("❌ Error mostrando los datos:", e)
  prisma.$disconnect()
  process.exit(1)
})
