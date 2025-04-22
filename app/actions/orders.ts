"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { saveOrderImages, deleteOrderImagesForOrder } from "./images"

export type Brand = {
  id: number
  NombreMarca: string | null
}

export type EquipmentType = {
  id: number
  NombreTipo: string | null
}

export type Order = {
  Id: number  // Changed from lowercase 'id' to match Prisma schema
  NombreCliente: string
  Identidad: string
  TelefonoPrincipal: string | null
  TelefonoSecundario?: string | null
  Modelo: string | null
  Marca: string | null
  TipoEquipo: string | null
  NumeroSerie: string | null
  Diagnostico?: string | null
  Reparacion?: string | null
  FechaEntrada: Date
}

export async function getBrands(): Promise<Brand[]> {
  try {
    return await prisma.marcas.findMany({
      select: {
        id: true,
        NombreMarca: true
      },
      orderBy: {
        NombreMarca: 'asc'
      }
    })
  } catch (error) {
    console.error("Error al obtener marcas:", error)
    return []
  }
}

export async function addBrand(brandName: string): Promise<number> {
  try {
    const newBrand = await prisma.marcas.create({
      data: {
        NombreMarca: brandName
      }
    })
    revalidatePath("/dashboard/add-order")
    revalidatePath("/dashboard/edit-order")
    return newBrand.id
  } catch (error) {
    console.error("Error al añadir marca:", error)
    throw new Error("No se pudo añadir la marca")
  }
}

export async function getEquipmentTypes(): Promise<EquipmentType[]> {
  try {
    return await prisma.tiposdeequipo.findMany({
      select: {
        id: true,
        NombreTipo: true
      },
      orderBy: {
        NombreTipo: 'asc'
      }
    })
  } catch (error) {
    console.error("Error al obtener tipos de equipo:", error)
    return []
  }
}

export async function addEquipmentType(typeName: string): Promise<number> {
  try {
    const newType = await prisma.tiposdeequipo.create({
      data: {
        NombreTipo: typeName
      }
    })
    revalidatePath("/dashboard/add-order")
    revalidatePath("/dashboard/edit-order")
    return newType.id
  } catch (error) {
    console.error("Error al añadir tipo de equipo:", error)
    throw new Error("No se pudo añadir el tipo de equipo")
  }
}

export async function saveOrder(orderData: Omit<Order, "Id">, images?: File[]): Promise<number> {
  try {
    const {
      NombreCliente,
      Identidad,
      TelefonoPrincipal,
      TelefonoSecundario,
      Modelo,
      Marca,
      TipoEquipo,
      NumeroSerie,
      Diagnostico,
      Reparacion,
      FechaEntrada,
    } = orderData

    const newOrder = await prisma.ordenesdetrabajo.create({
      data: {
        NombreCliente,
        Identidad,
        TelefonoPrincipal,
        TelefonoSecundario: TelefonoSecundario || null,
        Modelo,
        Marca,
        TipoEquipo,
        NumeroSerie,
        Diagnostico: Diagnostico || null,
        Reparacion: Reparacion || null,
        FechaEntrada: FechaEntrada || new Date(),
      }
    })
    const orderId = newOrder.Id

    if (images && images.length > 0) {
      await saveOrderImages(orderId, images)
    }

    revalidatePath("/dashboard/manage-orders")
    return orderId
  } catch (error) {
    console.error("Error al guardar orden:", error)
    throw new Error("No se pudo guardar la orden de trabajo")
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const orders = await prisma.ordenesdetrabajo.findMany({
      select: {
        Id: true,
        NombreCliente: true,
        Identidad: true,
        TelefonoPrincipal: true,
        TelefonoSecundario: true,
        Modelo: true,
        Marca: true,
        TipoEquipo: true,
        NumeroSerie: true,
        FechaEntrada: true
      },
      orderBy: {
        Id: 'desc'
      }
    })
    
    return orders
  } catch (error) {
    console.error("Error al obtener órdenes:", error)
    return []
  }
}

export async function getOrderById(id: number): Promise<Order | null> {
  try {
    const order = await prisma.ordenesdetrabajo.findUnique({
      where: { Id: id },
      select: {
        Id: true,
        NombreCliente: true,
        Identidad: true,
        TelefonoPrincipal: true,
        TelefonoSecundario: true,
        Modelo: true,
        Marca: true,
        TipoEquipo: true,
        NumeroSerie: true,
        Diagnostico: true,
        Reparacion: true,
        FechaEntrada: true
      }
    })
    
    return order
  } catch (error) {
    console.error(`Error al obtener orden con ID ${id}:`, error)
    return null
  }
}

export async function updateOrder(id: number, orderData: Omit<Order, "Id">, images?: File[]): Promise<boolean> {
  try {
    if (!id || typeof id !== "number") {
      throw new Error("ID de orden inválido")
    }
    
    const {
      NombreCliente,
      Identidad,
      TelefonoPrincipal,
      TelefonoSecundario,
      Modelo,
      Marca,
      TipoEquipo,
      NumeroSerie,
      Diagnostico,
      Reparacion,
      FechaEntrada,
    } = orderData

    await prisma.ordenesdetrabajo.update({
      where: { Id: id },
      data: {
        NombreCliente,
        Identidad,
        TelefonoPrincipal,
        TelefonoSecundario: TelefonoSecundario || null,
        Modelo,
        Marca,
        TipoEquipo,
        NumeroSerie,
        Diagnostico: Diagnostico || null,
        Reparacion: Reparacion || null,
        FechaEntrada: FechaEntrada || new Date(),
      }
    })

    if (images && images.length > 0) {
      await saveOrderImages(id, images)
    }

    revalidatePath("/dashboard/manage-orders")
    revalidatePath(`/dashboard/edit-order?id=${id}`)
    return true
  } catch (error) {
    console.error(`Error al actualizar orden con ID ${id}:`, error)
    return false
  }
}

export async function deleteOrder(id: number): Promise<boolean> {
  try {
    await deleteOrderImagesForOrder(id)
    await prisma.ordenesdetrabajo.delete({
      where: { Id: id }
    })
    revalidatePath("/dashboard/manage-orders")
    return true
  } catch (error) {
    console.error(`Error al eliminar orden con ID ${id}:`, error)
    return false
  }
}
