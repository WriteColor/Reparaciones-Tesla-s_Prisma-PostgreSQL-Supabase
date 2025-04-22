import type { Metadata } from "next"
import { ManageOrdersTable } from "@/components/manage-orders-table"
import { OrderNotificationHandler } from "@/components/ui/order-notification-handler"
import { requireAuth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Gestionar órdenes de trabajo | Reparaciones Tesla’s",
  icons: {
    icon: '/favicon.ico',
  },
}

export default async function ManageOrdersPage() {
  await requireAuth()
  return (
    <div className="space-y-6 mt-2">
      <div className="pb-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-center">Administrar Órdenes de Trabajo</h1>
        <p className="text-muted-foreground text-center">
          Filtra por fecha, busca por valores clave, edita, elimina, previsualiza y exporta órdenes de trabajo.
        </p>
      </div>
      <ManageOrdersTable />
      <OrderNotificationHandler />
    </div>
  )
}
