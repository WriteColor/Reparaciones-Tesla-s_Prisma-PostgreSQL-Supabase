import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Borrar todas las tablas primero
  await prisma.users.deleteMany()
  await prisma.tiposdeequipo.deleteMany()
  await prisma.marcas.deleteMany()
  await prisma.imagenes_ordenes.deleteMany()
  await prisma.ordenesdetrabajo.deleteMany()
  await prisma.sessions.deleteMany()
  await prisma.remember_tokens.deleteMany()
  
  // Resetear autoincrementables en PostgreSQL
  // PostgreSQL usa secuencias para los autoincrementables
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE users_id_seq RESTART WITH 1;`)
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE tiposdeequipo_id_seq RESTART WITH 1;`)
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE marcas_id_seq RESTART WITH 1;`)
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE imagenes_ordenes_id_seq RESTART WITH 1;`)
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE ordenesdetrabajo_id_seq RESTART WITH 1;`)
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE remember_tokens_id_seq RESTART WITH 1;`)

  console.log('✅ Base de datos vaciada y autoincrementables reiniciados.')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Error al resetear la base de datos:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
