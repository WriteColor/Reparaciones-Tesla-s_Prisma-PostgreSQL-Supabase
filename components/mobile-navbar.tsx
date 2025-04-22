"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ClipboardList, LogOut, PlusCircle, Settings } from "lucide-react"
import { notify } from "@/components/ui/notification"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useSidebar } from "@/components/sidebar-provider"
import { logout } from "@/app/actions/auth"

export function MobileNavbar() {
  const { isMobile } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const result = await logout()
      if (result.success) {
        localStorage.clear()
        sessionStorage.clear()
        notify("success", "Sesión cerrada", "Has cerrado sesión exitosamente")
        router.push("/")
        router.refresh()
      } else {
        notify("error", "Error al cerrar sesión", result.error)
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      notify("error", "Error", "No se pudo cerrar la sesión correctamente")
    }
  }

  if (!isMobile) return null

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg h-16">
      <nav className="flex justify-around items-center h-16">
        <MobileNavItem
          href="/dashboard/manage-orders"
          icon={<ClipboardList className="h-5 w-5" />}
          label="Gestionar Órdenes"
          isActive={pathname === "/dashboard/manage-orders"}
        />
        <MobileNavItem
          href="/dashboard/add-order"
          icon={<PlusCircle className="h-5 w-5" />}
          label="Añadir Orden"
          isActive={pathname === "/dashboard/add-order"}
        />
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center p-2 rounded-md transition-colors text-muted-foreground">
                <Settings className="h-5 w-5" />
                <span className="text-xs mt-1">Ajustes</span>
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[40vh]">
            <SheetHeader>
              <SheetTitle>Ajustes</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Establecer Tema</span>
                <ThemeSwitcher />
              </div>
              <Separator className="my-4" />
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="h-5 w-5 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}

function MobileNavItem({
  href,
  icon,
  label,
  isActive,
}: {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center w-full">
      <div
        className={`
        flex flex-col items-center justify-center p-2 rounded-md transition-colors
        ${isActive ? "text-primary" : "text-muted-foreground"}
      `}
      >
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </div>
    </Link>
  )
}
