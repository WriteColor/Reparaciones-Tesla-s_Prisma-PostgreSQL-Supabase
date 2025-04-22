"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { notify } from "@/components/ui/notification"

export function OrderNotificationHandler() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const id = searchParams.get("id")

  useEffect(() => {
    if (!error) return

    const showNotification = async () => {
      switch (error) {
        case "no-id":
          notify("warning", "ID no proporcionado", "No se proporcionó un ID de orden válido")
          break
        case "invalid-id":
          notify("warning", "ID inválido", "El ID de orden proporcionado no es válido")
          break
        case "not-found":
          notify("warning", "Orden no encontrada", `No se encontró la orden #${id}`)
          break
        case "fetch-error":
          notify("error", "Error de carga", `No se pudo cargar la información de la orden #${id}`)
          break
      }
    }

    const timer = setTimeout(() => {
      showNotification()
    }, 400)

    return () => clearTimeout(timer)
  }, [error, id])

  return null
}