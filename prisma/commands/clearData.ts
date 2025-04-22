import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🗑️ Iniciando eliminación de tablas de la base de datos...')
    
    // Desactivar temporalmente las restricciones de clave foránea para poder eliminar las tablas en cualquier orden
    await prisma.$executeRawUnsafe(`SET session_replication_role = 'replica';`)
    
    // Eliminar cada tabla por separado
    console.log('Eliminando tabla imagenes_ordenes...')
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "imagenes_ordenes" CASCADE;`)
    
    console.log('Eliminando tabla marcas...')
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "marcas" CASCADE;`)
    
    console.log('Eliminando tabla ordenesdetrabajo...')
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "ordenesdetrabajo" CASCADE;`)
    
    console.log('Eliminando tabla remember_tokens...')
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "remember_tokens" CASCADE;`)
    
    console.log('Eliminando tabla sessions...')
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "sessions" CASCADE;`)
    
    console.log('Eliminando tabla tiposdeequipo...')
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "tiposdeequipo" CASCADE;`)
    
    console.log('Eliminando tabla users...')
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "users" CASCADE;`)
    
    console.log('Eliminando tabla _prisma_migrations...')
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;`)
    
    // Restaurar las restricciones de clave foránea
    await prisma.$executeRawUnsafe(`SET session_replication_role = 'origin';`)
    
    console.log('✅ Todas las tablas han sido eliminadas correctamente.')
  } catch (error) {
    console.error('❌ Error al eliminar las tablas:', error)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Error inesperado:', e)
    await prisma.$disconnect()
    process.exit(1)
  })