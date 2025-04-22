import type { Metadata } from "next"
import { AddOrderForm } from "@/components/add-order-form"
import { requireAuth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Añadir Ordenes de trabajo | Reparaciones Tesla’s",
  icons: {
    icon: '/favicon.ico',
  },
}

export default async function AddOrderPage() {
  await requireAuth()
  return (
    <div className="space-y-6 mt-2">
      <div className="pb-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-center">Añadir Nueva Orden</h1>
        <p className="text-muted-foreground text-center">
          Cree una nueva orden de trabajo completando el formulario con los detalles requeridos.
        </p>
      </div>
      <AddOrderForm />
    </div>
  )
}
