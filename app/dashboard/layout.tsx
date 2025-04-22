import type React from "react"
import { DashboardWrapper } from "@/components/ui/dashboard-wrapper"
import { requireAuth } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  return <DashboardWrapper>{children}</DashboardWrapper>
}
