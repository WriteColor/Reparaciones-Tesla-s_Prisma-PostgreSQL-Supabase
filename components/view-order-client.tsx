"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, FileText, Image as ImageIcon, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { getOrderById } from "@/app/actions/orders"
import { notify } from "@/components/ui/notification"
import type { Order } from "@/app/actions/orders"
import { es } from "date-fns/locale"
import { useTheme } from "next-themes"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getOrderImages, OrderImage } from "@/app/actions/images"
import Image from "next/image"

// Add this CSS for print styling
import "@/app/globals.css"

export function ViewOrderClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPrinting, setIsPrinting] = useState(false)
  const { theme, setTheme } = useTheme()
  const [originalTheme, setOriginalTheme] = useState<string | undefined>(undefined)
  const [orderImages, setOrderImages] = useState<OrderImage[]>([])
  const [showImagesDialog, setShowImagesDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<OrderImage | null>(null)
  const [loadingImages, setLoadingImages] = useState(false)

  // Fetch order and images
  const fetchOrder = useCallback(async () => {
    setLoading(true)
    try {
      if (!id) {
        router.push("/dashboard/manage-orders")
        return
      }
      const orderData = await getOrderById(Number.parseInt(id))
      if (orderData) {
        setOrder(orderData)
        setLoadingImages(true)
        try {
          const images = await getOrderImages(orderData.Id)
          setOrderImages(images)
        } catch (error) {
          console.error("Error al cargar imágenes:", error)
          notify("warning", "Hubo un problema", "No se pudieron cargar las imágenes de la orden")
        } finally {
          setLoadingImages(false)
        }
      } else {
        notify("warning", "Hubo un problema", "No se encontró la orden de trabajo")
        router.push("/dashboard/manage-orders")
      }
    } catch (error) {
      console.error("Error al cargar la orden:", error)
      notify("warning", "Hubo un problema", "No se pudo cargar la información de la orden")
      router.push("/dashboard/manage-orders")
    } finally {
      setLoading(false)
    }
  }, [id, router])

  // Descargar imagen
  const handleDownloadImage = (image: OrderImage) => {
    if (!image.ruta_imagen) {
      notify("warning", "Hubo un problema", "No se pudo descargar la imagen")
      return
    }
    
    const link = document.createElement('a')
    link.href = image.ruta_imagen
    link.download = `imagen-orden-${order?.Id}-${image.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  // Print events
  useEffect(() => {
    const handleBeforePrint = () => {
      setOriginalTheme(theme)
      setTheme("light")
      document.body.classList.add('print-mode')
      document.documentElement.classList.add('printing')
      setIsPrinting(true)
    }
    const handleAfterPrint = () => {
      if (originalTheme) setTheme(originalTheme)
      document.body.classList.remove('print-mode')
      document.documentElement.classList.remove('printing')
      setIsPrinting(false)
    }
    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [theme, originalTheme, setTheme])

  // Exportar PDF
  const handleExportPDF = () => {
    setOriginalTheme(theme)
    setTheme("light")
    document.body.classList.add('print-mode')
    document.documentElement.classList.add('printing')
    setIsPrinting(true)
    setTimeout(() => {
      const style = document.createElement('style')
      style.id = 'custom-print-margins'
      style.innerHTML = `
        @page {
          margin: 5mm 0mm 5mm 0mm !important;
          size: A4 landscape;
        }
      `
      document.head.appendChild(style)
      window.print()
      setTimeout(() => {
        if (document.body.classList.contains('print-mode')) {
          if (originalTheme) setTheme(originalTheme)
          document.body.classList.remove('print-mode')
          document.documentElement.classList.remove('printing')
          setIsPrinting(false)
          const customStyle = document.getElementById('custom-print-margins')
          if (customStyle) customStyle.remove()
        }
      }, 1000)
    }, 200)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando datos de la orden...</p>
        </div>
      </div>
    )
  }

  if (!order) return null

  const CompanyInfo = () => (
    <div className="text-right">
      <h3 className="font-semibold">Reparaciones Tesla's</h3>
      <p className="text-sm text-muted-foreground print:text-black">Col. Pradera 1, última calle pavimentada, primera calle a la derecha,</p>
      <p className="text-sm text-muted-foreground print:text-black">segunda cuadra contigua al muro perimetral, casa número cuatro.</p>
      <p className="text-sm text-muted-foreground print:text-black">La Ceiba, Atlantida</p>
      <p className="text-sm text-muted-foreground print:text-black">Teléfono: +504 8768-2155</p>
    </div>
  )

  return (
    <div className={`space-y-6 ${isPrinting ? 'is-printing' : ''}`}>
      <div className="flex justify-between items-center print:hidden">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowImagesDialog(true)}
            className="print:hidden text-white"
            variant="default"
            disabled={loadingImages || orderImages.length === 0}
          >
            <ImageIcon className="mr-2 h-4 w-4 text-white" />
            {loadingImages ? 'Cargando...' : `Ver Evidencias (${orderImages.length})`}
          </Button>
          <Button onClick={handleExportPDF} className="print:hidden text-white">
            <FileText className="mr-2 h-4 w-4 text-white" />
            Exportar como PDF
          </Button>
        </div>
      </div>

      <Dialog open={showImagesDialog} onOpenChange={setShowImagesDialog}>
        <DialogContent
          className="sm:max-w-[80vw] max-h-[90vh] overflow-y-auto"
          hideCloseButton={!!selectedImage}
        >
          <DialogHeader>
            <DialogTitle>Evidencias de la Orden #{order?.Id}</DialogTitle>
          </DialogHeader>
          {loadingImages ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Cargando imágenes...</p>
            </div>
          ) : orderImages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay imágenes disponibles para esta orden.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {orderImages.map((image) => (
                <div key={image.id} className="relative group border rounded-md overflow-hidden">
                  <div
                    className="cursor-pointer aspect-square relative"
                    onClick={() => setSelectedImage(image)}
                  >
                    {image.ruta_imagen && (
                      <Image
                        src={image.ruta_imagen}
                        alt={`Imagen ${image.id}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-gray-500"
                    onClick={() => handleDownloadImage(image)}
                  >
                    <Download className="h-4 w-4 text-white" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-[90vw] max-h-[95vh] p-0 overflow-hidden bg-transparent border-0 shadow-none" hideCloseButton>
          <DialogHeader className="sr-only">
            <DialogTitle>Imagen ampliada</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[90vh]">
            {selectedImage && selectedImage.ruta_imagen && (
              <>
                <Image
                  src={selectedImage.ruta_imagen}
                  alt={`Imagen ampliada ${selectedImage.id}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-5 text-white bg-black/50 hover:bg-gray-500"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-12 right-5 text-white bg-black/50 hover:bg-gray-500"
                  onClick={() => selectedImage && handleDownloadImage(selectedImage)}
                >
                  <Download className="h-4 w-4 text-white" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div id="printable-content" className="space-y-4">
        <Card className="print:shadow-none print:border-none">
          <CardContent className="pt-4 print:pt-0">
            <div className="flex justify-between items-start print:mt-0">
              <div>
                <h2 className="text-2xl font-bold print:text-xl">Orden de Trabajo #{order.Id}</h2>
                <p className="text-muted-foreground print:text-black print:text-sm">
                  Fecha de Entrada: {format(new Date(order.FechaEntrada), "PPP", { locale: es })}
                </p>
              </div>
              <CompanyInfo />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 print:mt-3 print:gap-4 print:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2">Información del Cliente</h3>
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Nombre Completo:</span>
                      <span>{order.NombreCliente || ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Número de Identidad:</span>
                      <span>{order.Identidad || ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Teléfono Principal:</span>
                      <span>{order.TelefonoPrincipal || ""}</span>
                    </div>
                    {order.TelefonoSecundario && (
                      <div className="flex justify-between">
                        <span className="font-medium">Teléfono Secundario:</span>
                        <span>{order.TelefonoSecundario}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2">Información del Equipo</h3>
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Modelo:</span>
                      <span>{order.Modelo || ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Marca:</span>
                      <span>{order.Marca || ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tipo:</span>
                      <span>{order.TipoEquipo || ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Número de Serie:</span>
                      <span>{order.NumeroSerie || ""}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2">Diagnóstico</h3>
                  <div className="mt-4 p-4 bg-muted/50 rounded-md min-h-[100px] print:bg-white print:border print:border-gray-200">
                    {order.Diagnostico || "No se proporcionó diagnóstico."}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2">Reparación</h3>
                  <div className="mt-4 p-4 bg-muted/50 rounded-md min-h-[100px] print:bg-white print:border print:border-gray-200">
                    {order.Reparacion || "No se proporcionó información de reparación."}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t print:mt-4 print:pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Términos y Condiciones</h3>
                  <p className="text-sm text-muted-foreground mt-2 print:text-black">
                    Todas las reparaciones tienen una garantía de 30 días en piezas y mano de obra. La garantía no cubre
                    daños físicos, daños por agua o cualquier modificación realizada después de la reparación.
                  </p>
                  <div className="mt-4 flex justify-start print:mt-2">
                    <img
                      src="/favicon.ico"
                      alt="Logo"
                      className="w-20 h-20 print:w-16 print:h-16 rounded-md"
                      style={{ printColorAdjust: 'exact' }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Firma del Cliente:
                    </h3>
                    <div className="border-b h-10"></div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-1">
                      Firma del Técnico:
                    </h3>
                    <div className="border-b h-10"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}