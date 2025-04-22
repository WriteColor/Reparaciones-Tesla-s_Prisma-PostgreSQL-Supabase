"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EditOrderForm } from "@/components/edit-order-form"
import { Loader2 } from "lucide-react"
import { getOrderById } from "@/app/actions/orders"
import { notify } from "@/components/ui/notification"
import type { Order } from "@/app/actions/orders"

interface EditOrderClientProps {
  orderId: number
  initialOrder: Order
}

export function EditOrderClient({ orderId, initialOrder }: EditOrderClientProps) {
  const router = useRouter()
  const [order, setOrder] = useState<Order>(initialOrder)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyOrder = async () => {
      setLoading(true)
      try {
        const refreshedOrder = await getOrderById(orderId)
        if (!refreshedOrder) {
          notify("error", "Orden no encontrada", "No se encontró la orden de trabajo solicitada")
          router.push("/dashboard/manage-orders")
          return
        }
        setOrder(refreshedOrder)
      } catch (error) {
        console.error("Error al verificar la orden:", error)
        notify("error", "Error de carga", "No se pudo cargar la información de la orden")
        router.push("/dashboard/manage-orders")
      } finally {
        setTimeout(() => setLoading(false), 500)
      }
    }
    verifyOrder()
  }, [orderId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando datos de la orden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-2">
      <div className="pb-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-center">
          Editar Orden #{order.Id}
        </h1>
        <p className="text-muted-foreground text-center">
          Modifica los detalles de la orden de trabajo seleccionada según los cambios que requieras.
        </p>
      </div>
      <EditOrderForm order={order} />
    </div>
  )
}