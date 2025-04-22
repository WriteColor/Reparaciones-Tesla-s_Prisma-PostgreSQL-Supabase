// components/ui/notification.tsx
"use client"

import { toast } from "sonner"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

export const notify = (
  type: "success" | "warning" | "error",
  title: string,
  description?: string
) => {
  const iconConfig = {
    success: <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />,
    warning: <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />,
    error: <XCircle className="h-5 w-5 mr-2 text-rose-600" />
  }

  // Colores más claros y representativos para el fondo de la notificación
  const themeClasses = {
    success: "bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-200/80 dark:border-emerald-400 dark:text-emerald-900",
    warning: "bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-200/80 dark:border-amber-400 dark:text-amber-900",
    error: "bg-rose-100 border-rose-300 text-rose-900 dark:bg-rose-200/80 dark:border-rose-400 dark:text-rose-900"
  }

  toast[type](title, {
    description,
    icon: iconConfig[type],
    className: `border rounded-lg p-4 pr-8 shadow-lg ${themeClasses[type]}`,
    duration: 5000,
    position: "top-right"
  })
}