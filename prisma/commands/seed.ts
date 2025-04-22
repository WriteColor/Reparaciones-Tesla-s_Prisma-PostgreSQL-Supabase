import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Reiniciar secuencias antes de insertar datos
  try {
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE marcas_id_seq RESTART WITH 1;`)
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE tiposdeequipo_id_seq RESTART WITH 1;`)
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE users_id_seq RESTART WITH 1;`)
  } catch (error) {
    console.warn("Advertencia: No se pudieron reiniciar las secuencias. Esto es normal en la primera ejecución.")
  }

  // Insertar marcas
  await prisma.marcas.createMany({
    data: [
      { NombreMarca: "ADATA" },
      { NombreMarca: "Acer" },
      { NombreMarca: "AMD" },
      { NombreMarca: "Apple" },
      { NombreMarca: "Asus" },
      { NombreMarca: "Beats" },
      { NombreMarca: "Bose" },
      { NombreMarca: "Brother" },
      { NombreMarca: "Canon" },
      { NombreMarca: "Corsair" },
      { NombreMarca: "DJI" },
      { NombreMarca: "Dell" },
      { NombreMarca: "Epson" },
      { NombreMarca: "Fitbit" },
      { NombreMarca: "Fujifilm" },
      { NombreMarca: "Garmin" },
      { NombreMarca: "Gigabyte" },
      { NombreMarca: "HP" },
      { NombreMarca: "Huawei" },
      { NombreMarca: "Intel" },
      { NombreMarca: "JBL" },
      { NombreMarca: "Kingston" },
      { NombreMarca: "LG" },
      { NombreMarca: "Lenovo" },
      { NombreMarca: "Logitech" },
      { NombreMarca: "Microsoft" },
      { NombreMarca: "Motorola" },
      { NombreMarca: "MSI" },
      { NombreMarca: "Nikon" },
      { NombreMarca: "Nokia" },
      { NombreMarca: "NVIDIA" },
      { NombreMarca: "OnePlus" },
      { NombreMarca: "Olympus" },
      { NombreMarca: "Oppo" },
      { NombreMarca: "Panasonic" },
      { NombreMarca: "Philips" },
      { NombreMarca: "Razer" },
      { NombreMarca: "Realme" },
      { NombreMarca: "Samsung" },
      { NombreMarca: "SanDisk" },
      { NombreMarca: "Seagate" },
      { NombreMarca: "Sennheiser" },
      { NombreMarca: "Sony" },
      { NombreMarca: "TP-Link" },
      { NombreMarca: "Toshiba" },
      { NombreMarca: "Ubiquiti" },
      { NombreMarca: "Vivo" },
      { NombreMarca: "Western Digital" },
      { NombreMarca: "Xiaomi" },
      { NombreMarca: "Marvo" }
    ],
    skipDuplicates: true,
  })

  // Insertar tipos de equipo
  await prisma.tiposdeequipo.createMany({
    data: [
      { NombreTipo: "Adaptador Wi-Fi" },
      { NombreTipo: "Altavoces" },
      { NombreTipo: "Auriculares" },
      { NombreTipo: "Cámara digital" },
      { NombreTipo: "Consola de videojuegos" },
      { NombreTipo: "Control remoto" },
      { NombreTipo: "Desktop" },
      { NombreTipo: "Disco duro externo" },
      { NombreTipo: "Drone" },
      { NombreTipo: "Escáner" },
      { NombreTipo: "Impresora" },
      { NombreTipo: "Laptop" },
      { NombreTipo: "Memoria USB" },
      { NombreTipo: "Micrófono" },
      { NombreTipo: "Monitor" },
      { NombreTipo: "Mouse" },
      { NombreTipo: "Proyector" },
      { NombreTipo: "Reproductor Blu-ray" },
      { NombreTipo: "Reproductor multimedia" },
      { NombreTipo: "Router" },
      { NombreTipo: "SSD" },
      { NombreTipo: "Sistema de sonido" },
      { NombreTipo: "Smartphone" },
      { NombreTipo: "Smartwatch" },
      { NombreTipo: "Tablet" },
      { NombreTipo: "Tarjeta gráfica" },
      { NombreTipo: "Teclado" },
      { NombreTipo: "Televisión" },
      { NombreTipo: "UPS" },
      { NombreTipo: "Videocámara" },
    ],
    skipDuplicates: true,
  })

  // Insertar usuario de prueba
  try {
    await prisma.users.create({
      data: {
        username: "Toruño",
        password: "25L23D21D27M15M29J23Y15M20J20Y",
        created_at: new Date("2024-10-28T07:25:33Z"),
        updated_at: new Date("2025-04-04T01:19:43Z")
      }
    })
  } catch (error) {
    console.warn("El usuario ya existe, omitiendo creación.")
  }
}

main()
  .then(() => {
    console.log("✅ Datos insertados correctamente.")
  })
  .catch((e) => {
    console.error("❌ Error en el seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
export{}