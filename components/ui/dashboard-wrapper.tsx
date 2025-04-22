"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNavbar } from "@/components/mobile-navbar"
import { SidebarProvider } from "@/components/sidebar-provider"

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
          <MobileNavbar />
        </div>
      </div>
    </SidebarProvider>
  )
}