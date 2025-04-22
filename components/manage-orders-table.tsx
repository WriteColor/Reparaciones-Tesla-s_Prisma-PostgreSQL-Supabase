"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  CalendarIcon,
  Edit,
  FileText,
  Filter,
  Search,
  Trash2,
  X
} from "lucide-react"

import { notify } from "@/components/ui/notification"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"
import { formatIdentity } from "@/lib/format-utils"

import {
  deleteOrder,
  getOrders,
  type Order
} from "@/app/actions/orders"

export function ManageOrdersTable() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getOrders()
      setOrders(data)
    } catch (error) {
      console.error("Error al cargar órdenes:", error)
      notify("error", "Error", "No se pudieron cargar las órdenes de trabajo")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleEdit = (order: Order) => {
    router.push(`/dashboard/edit-order?id=${order.Id}`)
  }

  const handleDelete = (order: Order) => {
    setSelectedOrder(order)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (selectedOrder) {
      try {
        await deleteOrder(selectedOrder.Id)
        setOrders((prev) => prev.filter((o) => o.Id !== selectedOrder.Id))
        notify("success", "Éxito", "Orden de trabajo eliminada correctamente")
      } catch (error) {
        console.error("Error al eliminar orden:", error)
        notify("error", "Error", "No se pudo eliminar la orden de trabajo")
      } finally {
        setShowDeleteDialog(false)
        setSelectedOrder(null)
      }
    }
  }

  const handleView = (order: Order) => {
    router.push(`/dashboard/view-order?id=${order.Id}`)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setDateRange({})
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.Id.toString().includes(searchTerm.toLowerCase()) ||
      (order.NombreCliente ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.Identidad ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.TelefonoPrincipal ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.Modelo ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.Marca ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.TipoEquipo ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.NumeroSerie ?? "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDateRange =
      (!dateRange.from || (order.FechaEntrada && order.FechaEntrada >= dateRange.from)) &&
      (!dateRange.to || (order.FechaEntrada && order.FechaEntrada <= dateRange.to))

    return matchesSearch && matchesDateRange
  })

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por: ID, cliente, documento, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filtros de Búsqueda
              {(dateRange.from || dateRange.to) && (
                <Badge variant="secondary" className="ml-2">Activo</Badge>
              )}
            </Button>
            {(searchTerm || dateRange.from || dateRange.to) && (
              <Button variant="ghost" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Restablecer
              </Button>
            )}
          </div>
        </div>

        {/* Calendario de filtros */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="space-y-2 flex-1">
                  <h3 className="text-sm font-medium">Rango de Fechas</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Desde */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? format(dateRange.from, "PPP", { locale: es }) : "Desde"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange({ ...dateRange, from: date ?? undefined })}
                          locale={es}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {/* Hasta */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateRange.to && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? format(dateRange.to, "PPP", { locale: es }) : "Hasta"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange({ ...dateRange, to: date ?? undefined })}
                          locale={es}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de órdenes */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Serie</TableHead>
                <TableHead>Ingreso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.Id}>
                    <TableCell className="font-medium">#{order.Id}</TableCell>
                    <TableCell className="text-xs">{order.NombreCliente ?? ""}</TableCell>
                    <TableCell className="text-xs">{formatIdentity(order.Identidad ?? "")}</TableCell>
                    <TableCell className="text-xs">{order.TelefonoPrincipal ?? ""}</TableCell>
                    <TableCell className="text-xs">{order.Modelo ?? ""}</TableCell>
                    <TableCell className="text-xs">{order.Marca ?? ""}</TableCell>
                    <TableCell className="text-xs">{order.TipoEquipo ?? ""}</TableCell>
                    <TableCell className="text-xs">{order.NumeroSerie ?? ""}</TableCell>
                    <TableCell className="text-xs">
                      {order.FechaEntrada
                        ? format(order.FechaEntrada, "MMM d, yyyy", { locale: es })
                        : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => handleView(order)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver|Exportar Orden</TooltipContent>
                        </Tooltip>                        
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => handleEdit(order)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar Orden</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => handleDelete(order)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar Orden</TooltipContent>
                        </Tooltip>

                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    No se encontraron órdenes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Diálogo de eliminación */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
              <DialogDescription>
                ¿Está seguro que desea eliminar la orden #{selectedOrder?.Id} de{" "}
                {selectedOrder?.NombreCliente}? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}