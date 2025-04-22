"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ClipboardList, LogOut, Menu, PlusCircle } from "lucide-react"
import { notify } from "@/components/ui/notification"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useSidebar } from "@/components/sidebar-provider"
import { logout } from "@/app/actions/auth"

interface NavProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}

export function AppSidebar() {
  const { isOpen, setIsOpen, isMobile } = useSidebar()
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
      notify("error", "Error al cerrar sesión", "No se pudo cerrar la sesión correctamente")
    }
  }

  if (isMobile) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  }

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ width: 250, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-screen bg-card border-r shadow-sm overflow-hidden flex flex-col"
          >
            <motion.div 
              className="flex flex-col h-full"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={itemVariants} className="p-4 border-b text-center">
                <h2 className="font-semibold text-lg text-primary">Reparaciones Tesla’s</h2>
              </motion.div>
              <nav className="flex-1 p-2 space-y-1">
                <motion.div variants={itemVariants}>
                  <NavItem
                    href="/dashboard/manage-orders"
                    icon={<ClipboardList className="h-5 w-5" />}
                    label="Gestionar Órdenes"
                    isActive={pathname === "/dashboard/manage-orders"}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <NavItem
                    href="/dashboard/add-order"
                    icon={<PlusCircle className="h-5 w-5" />}
                    label="Añadir Orden"
                    isActive={pathname === "/dashboard/add-order"}
                  />
                </motion.div>
              </nav>
              <motion.div variants={itemVariants} className="p-4 border-t">
                <div className="flex items-center justify-around mb-4">
                  <span className="text-sm text-right">Establecer Tema</span>
                  <ThemeSwitcher />
                </div>
                <Separator className="my-2" />
                <Button
                  className="w-full flex items-center justify-center text-white hover:bg-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-4 mr-2 text-white" />
                  Cerrar Sesión
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ width: 50 }}
            animate={{ width: 50 }}
            className="h-screen bg-card border-r shadow-sm overflow-hidden"
          >
            <div className="p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="w-full"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-2 space-y-2">
              <NavIconOnly
                href="/dashboard/manage-orders"
                icon={<ClipboardList className="h-5 w-5" />}
                label="Gestionar Órdenes"
                isActive={pathname === "/dashboard/manage-orders"}
              />
              <NavIconOnly
                href="/dashboard/add-order"
                icon={<PlusCircle className="h-5 w-5" />}
                label="Añadir Orden"
                isActive={pathname === "/dashboard/add-order"}
              />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  )
}

function NavItem({ href, icon, label, isActive }: NavProps) {
  return (
    <Link href={href} className="block">
      <div
        className={`
        flex items-center space-x-3 px-3 py-2 rounded-md transition-colors
        ${isActive
            ? "bg-primary text-white dark:bg-primary dark:text-white"
            : "hover:bg-accent hover:text-accent-foreground"}
      `}
      >
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  )
}

function NavIconOnly({ href, icon, label, isActive }: NavProps) {
  return (
    <Link href={href} className="block relative group">
      <div
        className={`
        p-2 rounded-md transition-colors
        ${isActive
            ? "bg-primary text-white dark:bg-primary dark:text-white"
            : "hover:bg-accent hover:text-accent-foreground"}
      `}
      >
        {icon}
      </div>
      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </div>
    </Link>
  )
}
