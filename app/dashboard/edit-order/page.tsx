import type { Metadata } from "next"
import { EditOrderClient } from "@/app/dashboard/edit-order/header-page"
import { getOrderById } from "@/app/actions/orders"
import { requireAuth } from "@/lib/auth"
import { redirect } from "next/navigation"

// Generate metadata dynamically based on the order ID
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ id?: string }> }): Promise<Metadata> {
  const params = await searchParams
  const id = params?.id || ""
  return {
    title: id ? `Editar Orden #${id} | Reparaciones Tesla’s` : "Editar Orden | Reparaciones Tesla’s",
    description: "Editar información de la orden de trabajo",
    icons: {
      icon: '/favicon.ico',
    },
  }
}

export default async function EditOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  await requireAuth()
  const params = await searchParams

  if (!params?.id) {
    redirect("/dashboard/manage-orders?error=no-id")
  }

  const id = parseInt(params.id as string)
  if (isNaN(id)) {
    redirect("/dashboard/manage-orders?error=invalid-id")
  }

  try {
    const initialOrder = await getOrderById(id)
    if (!initialOrder) {
      redirect(`/dashboard/manage-orders?error=not-found&id=${id}`)
    }
    return <EditOrderClient orderId={id} initialOrder={initialOrder} />
  } catch (error: any) {
    // Only log unexpected errors, not Next.js redirects
    if (!(typeof error?.digest === "string" && error.digest.startsWith("NEXT_REDIRECT"))) {
      console.error("Error fetching order:", error)
    }
    redirect(`/dashboard/manage-orders?error=fetch-error&id=${id}`)
  }
}