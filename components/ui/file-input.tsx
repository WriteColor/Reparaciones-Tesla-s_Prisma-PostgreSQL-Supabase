"use client"

import * as React from "react"
import { Upload, X, Loader2, Download } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { OrderImage } from "@/app/actions/images"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type ImagePreview = {
  id: string
  file?: File
  data: string
  dbId?: number
}

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesChange?: (files: File[]) => void
  value?: File[]
  existingImages?: OrderImage[]
  accept?: string
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  loading?: boolean
  onDeleteImage?: (imageId: number) => Promise<void>
  showDeleteConfirmation?: boolean
}

export function FileUploader({
  onFilesChange,
  value = [],
  existingImages = [],
  accept = "image/*",
  maxFiles = 20,
  maxSize = 50,
  disabled,
  loading,
  onDeleteImage,
  showDeleteConfirmation = true,
  className,
  ...props
}: FileUploaderProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [imageToDelete, setImageToDelete] = React.useState<{ id: string, dbId?: number } | null>(null)
  const [previews, setPreviews] = React.useState<ImagePreview[]>([])
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      const existingPreviews = existingImages.map(img => {
        // Handle different image data formats
        let imageData = '';
        
        // Check if we have base64 data
        if (img.datos_imagen && (
          img.datos_imagen.startsWith('data:') || 
          !img.datos_imagen.includes('/')
        )) {
          // It's already base64 or needs to be formatted as base64
          imageData = img.datos_imagen.startsWith('data:') 
            ? img.datos_imagen 
            : `data:${img.tipo_archivo || 'image/jpeg'};base64,${img.datos_imagen}`;
        } 
        // Check if we have a file path
        else if (img.ruta_imagen) {
          // For production build, ensure path is absolute
          imageData = img.ruta_imagen.startsWith('/') 
            ? img.ruta_imagen 
            : `/${img.ruta_imagen}`;
        }
        
        return {
          id: `db-${img.id}`,
          data: imageData,
          dbId: img.id
        };
      });
      
      setPreviews(prev => [
        ...existingPreviews,
        ...prev.filter(p => !p.dbId)
      ]);
    }
  }, [existingImages]);

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo ${file.name} excede el tamaño máximo de ${maxSize}MB`)
      return false
    }
    if (!file.type.startsWith('image/')) {
      setError(`El archivo ${file.name} no es una imagen válida`)
      return false
    }
    return true
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const files = Array.from(e.target.files || [])
    const newPreviewsCount = previews.filter(p => !p.dbId).length

    if (newPreviewsCount + files.length > maxFiles) {
      setError(`Solo puede subir un máximo de ${maxFiles} archivos`)
      return
    }

    const validFiles = files.filter(validateFile)
    const newPreviews = await Promise.all(
      validFiles.map(async file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        data: await toBase64(file)
      }))
    )

    setPreviews(prev => [...prev, ...newPreviews])
    if (onFilesChange) {
      onFilesChange([...value, ...validFiles])
    }
  }

  const deleteImage = (id: string, dbId?: number) => {
    if (showDeleteConfirmation) {
      setImageToDelete({ id, dbId })
      setShowDeleteDialog(true)
    } else {
      // Eliminar directamente sin confirmación
      handleDirectDelete(id, dbId)
    }
  }

  const handleDirectDelete = async (id: string, dbId?: number) => {
    if (dbId && onDeleteImage) {
      try {
        await onDeleteImage(dbId)
      } catch (error) {
        setError("No se pudo eliminar la imagen del servidor")
        return
      }
    }

    const newPreviews = previews.filter(img => img.id !== id)
    setPreviews(newPreviews)
    if (selectedImage === id) setSelectedImage(null)

    if (onFilesChange && !dbId) {
      const newFiles = newPreviews.filter(p => p.file).map(p => p.file as File)
      onFilesChange(newFiles)
    }
  }

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return
    await handleDirectDelete(imageToDelete.id, imageToDelete.dbId)
    setShowDeleteDialog(false)
  }

  const downloadImage = (data: string, filename: string) => {
    const link = document.createElement('a')
    link.href = data
    link.download = filename || 'imagen.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Subir Evidencias | Estado del equipo
          </>
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || loading}
      />

      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map(({ id, data, dbId }) => (
            <div key={id} className="relative group">
              <img
                src={data}
                alt={`Vista previa ${id.slice(0, 5)}`}
                className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                onClick={() => setSelectedImage(data)}
              />
              <div className="absolute -top-2 -right-2 flex space-x-1">
                {dbId && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6 group-hover:opacity-100 transition-opacity"
                    onClick={e => {
                      e.stopPropagation()
                      const downloadUrl = data.startsWith('/')
                        ? window.location.origin + data
                        : data
                      downloadImage(downloadUrl, `imagen-${dbId}.jpg`)
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6 group-hover:opacity-100 transition-opacity"
                  onClick={e => {
                    e.stopPropagation()
                    deleteImage(id, dbId)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl w-full">
            <img
              src={selectedImage}
              alt="Vista expandida"
              className="max-h-[80vh] w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar esta imagen? Esta acción no se puede deshacer, incluso si no actualiza la orden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteImage}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
