import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reparaciones Tesla’s",
  icons: {
    icon: '/favicon.ico',
  },
}

export default async function DashboardPage() {
  redirect("/dashboard/manage-orders")
}
