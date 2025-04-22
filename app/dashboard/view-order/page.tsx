import type { Metadata } from "next"
import { ViewOrderClient } from "@/components/view-order-client"
import { requireAuth } from "@/lib/auth"

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ id?: string }> }): Promise<Metadata> {
  const params = await searchParams
  const id = params?.id
  return {
    title: id ? `Orden #${id}` : "Vista Previa - Orden",
    description: "Vista detallada de la orden de trabajo",
    icons: {
      icon: '/favicon.ico',
    },
  }
}

export default async function ViewOrderPage() {
  await requireAuth()
  return <ViewOrderClient />
}
