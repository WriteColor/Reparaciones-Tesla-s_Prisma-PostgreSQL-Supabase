"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import fs from "fs"
import path from "path"
import { headers } from "next/headers"

export type OrderImage = {
  id: number
  orden_id: number
  nombre_archivo: string
  tipo_archivo: string
  datos_imagen: string
  ruta_imagen: string
  fecha_creacion: Date
}

// Función mejorada para obtener la URL base en cualquier entorno
async function getBaseUrl() {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || ''
    
    // Determinar el protocolo adecuado
    let protocol = 'http'
    
    // Verificar si estamos en un entorno seguro
    const forwardedProto = headersList.get('x-forwarded-proto')
    if (forwardedProto) {
      protocol = forwardedProto
    } else if (
      !host.includes('localhost') && 
      !host.includes('127.0.0.1') && 
      !host.includes('github.dev') && 
      !host.includes('codespaces') &&
      !host.includes('github.io')
    ) {
      // Por defecto usar HTTPS para dominios que no son localhost o GitHub
      protocol = 'https'
    }
    
    // Para entornos de GitHub, siempre usar HTTP para evitar errores SSL
    if (host.includes('github') || process.env.GITHUB_ACTIONS || process.env.CODESPACES) {
      protocol = 'http'
    }
    
    if (host) {
      // Evitar usar localhost en la URL base
      if (host.includes('localhost') || host.includes('127.0.0.1')) {
        // En entornos locales, usar rutas relativas en lugar de absolutas
        return ''
      }
      return `${protocol}://${host}`
    }
  } catch (error) {
    console.error("Error al obtener headers:", error)
  }
  
  // Fallbacks en orden de prioridad
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Último recurso: usar ruta relativa
  return ''
}

// Función auxiliar para realizar fetch de manera segura
async function safeFetch(url: string, options: RequestInit = {}) {
  // Establecer en true solo cuando necesites depurar problemas
  const DEBUG_MODE = false;
  
  const logDebug = (message: string) => {
    if (DEBUG_MODE) {
      console.log(message);
    }
  };
  
  try {
    // Si la URL es relativa, necesitamos convertirla a absoluta para el entorno de servidor
    if (url.startsWith('/')) {
      // En el entorno de servidor, necesitamos una URL absoluta
      const baseUrl = await getBaseUrl()
      
      if (baseUrl) {
        // Si tenemos una base URL, usarla
        url = `${baseUrl}${url}`
      } else {
        // Si no tenemos base URL, usar una URL base ficticia para que sea válida
        // Esto es necesario porque fetch en el servidor requiere URLs absolutas
        url = `http://localhost${url}`
      }
    }
    
    // Evitar explícitamente localhost en las URLs
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      // En GitHub, intentar con una URL absoluta usando el host actual
      try {
        const headersList = await headers()
        const host = headersList.get('host') || 'localhost:3000'
        url = `http://${host}${new URL(url).pathname}${new URL(url).search}`
      } catch (urlError) {
        logDebug("Error al procesar URL: " + urlError);
      }
    }
    
    logDebug(`Intentando fetch a: ${url}`);
    return await fetch(url, options)
  } catch (error) {
    // Los errores siempre se registran, incluso en modo no depuración
    console.error(`Error en fetch a ${url}:`, error)
    
    // Si el error es de URL inválida, intentar con una URL absoluta
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      try {
        // Intentar con una URL absoluta usando el host actual
        const headersList = await headers()
        const host = headersList.get('host') || 'localhost:3000'
        const newUrl = `http://${host}${url}`
        logDebug(`Reintentando con URL absoluta: ${newUrl}`);
        return await fetch(newUrl, options)
      } catch (retryError) {
        console.error(`Error en segundo intento con URL absoluta:`, retryError)
      }
    }
    
    // Si hay un error SSL y estamos usando HTTPS, intentar con HTTP
    if (error instanceof Error && 
        ((error as any).code === 'ERR_SSL_WRONG_VERSION_NUMBER' || 
         error.message.includes('SSL') || 
         error.message.includes('ssl')) && 
        url.startsWith('https://')) {
      const httpUrl = url.replace('https://', 'http://')
      logDebug(`Reintentando con HTTP: ${httpUrl}`);
      try {
        return await fetch(httpUrl, options)
      } catch (retryError) {
        console.error(`Error en segundo intento con HTTP: ${httpUrl}`, retryError)
      }
    }
    
    // Como último recurso, intentar con una solicitud directa al sistema de archivos
    if (process.env.NODE_ENV !== 'development' && url.includes('filesystem') && url.includes('path=')) {
      try {
        // Extraer la ruta y el tipo de la URL
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const filePath = urlParams.get('path');
        const isFile = urlParams.get('isFile') === 'true';
        
        if (filePath) {
          logDebug(`Intentando eliminar directamente: ${filePath} (${isFile ? 'archivo' : 'directorio'})`);
          
          // Intentar eliminar directamente usando el sistema de archivos
          const fullPath = path.join(process.cwd(), 'public', filePath);
          
          if (fs.existsSync(fullPath)) {
            if (isFile) {
              fs.unlinkSync(fullPath);
            } else {
              // Eliminar directorio recursivamente
              const deleteDir = (dirPath: string) => {
                if (fs.existsSync(dirPath)) {
                  fs.readdirSync(dirPath).forEach((file) => {
                    const curPath = path.join(dirPath, file);
                    if (fs.lstatSync(curPath).isDirectory()) {
                      deleteDir(curPath);
                    } else {
                      fs.unlinkSync(curPath);
                    }
                  });
                  fs.rmdirSync(dirPath);
                }
              };
              
              deleteDir(fullPath);
            }
            
            logDebug(`Eliminación directa exitosa: ${filePath}`);
            // Devolver una respuesta simulada
            return {
              ok: true,
              json: async () => ({ success: true }),
              status: 200,
            } as Response;
          }
        }
      } catch (fsError) {
        console.error(`Error en eliminación directa:`, fsError);
      }
    }
    
    throw error;
  }
}

export async function saveImageToLocal(
  ordenId: number,
  file: File
): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uploadDir = path.join(process.cwd(), "public", "uploads", ordenId.toString())
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const filePath = path.join(uploadDir, uniqueFilename)
    fs.writeFileSync(filePath, buffer)
    return `/uploads/${ordenId}/${uniqueFilename}`
  } catch (error) {
    console.error("Error al guardar la imagen localmente:", error)
    throw new Error("No se pudo guardar la imagen en el servidor")
  }
}

export async function saveOrderImage(
  ordenId: number,
  file: File
): Promise<number> {
  try {
    const imagePath = await saveImageToLocal(ordenId, file)
    const newImage = await prisma.imagenes_ordenes.create({
      data: {
        orden_id: ordenId,
        nombre_archivo: file.name,
        tipo_archivo: file.type,
        ruta_imagen: imagePath
      }
    })
    revalidatePath(`/dashboard/edit-order?id=${ordenId}`)
    return newImage.id
  } catch (error) {
    console.error("Error al guardar la imagen:", error)
    throw new Error("No se pudo guardar la imagen")
  }
}

export async function saveOrderImages(
  ordenId: number,
  files: File[]
): Promise<number[]> {
  try {
    const imageIds: number[] = []
    for (const file of files) {
      const id = await saveOrderImage(ordenId, file)
      imageIds.push(id)
    }
    return imageIds
  } catch (error) {
    console.error("Error al guardar las imágenes:", error)
    throw new Error("No se pudieron guardar todas las imágenes")
  }
}

// Función para determinar la URL correcta de la imagen según el entorno
export async function getImageUrl(imagePath: string): Promise<string> {
  if (!imagePath) return '';
  
  // Eliminar la barra inicial si existe
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  // En desarrollo, usar la ruta directa
  if (process.env.NODE_ENV === 'development') {
    return `/${cleanPath}`;
  }
  
  // En producción, usar la API route
  // Extraer la parte después de /uploads/
  const pathParts = cleanPath.split('/');
  if (pathParts[0] === 'uploads') {
    // Construir la ruta para la API
    const apiPath = `/api/images/${pathParts.slice(1).join('/')}`;
    
    // Verificar si estamos en GitHub Codespaces o entornos similares
    const headersList = await headers();
    const host = headersList.get('host') || '';
    
    if (host.includes('github') || process.env.GITHUB_ACTIONS || process.env.CODESPACES) {
      // En GitHub, usar la ruta original para evitar problemas con la API
      return `/${cleanPath}`;
    }
    
    return apiPath;
  }
  
  // Si no es una ruta de uploads, devolver la original
  return `/${cleanPath}`;
}

// Modificar la función getOrderImages para usar la nueva función
export async function getOrderImages(ordenId: number): Promise<OrderImage[]> {
  try {
    const images = await prisma.imagenes_ordenes.findMany({
      where: {
        orden_id: ordenId
      },
      select: {
        id: true,
        orden_id: true,
        nombre_archivo: true,
        tipo_archivo: true,
        ruta_imagen: true,
        fecha_creacion: true
      }
    })
    
    const processedImages = await Promise.all(images.map(async (img) => ({
      id: img.id,
      orden_id: img.orden_id,
      nombre_archivo: img.nombre_archivo,
      tipo_archivo: img.tipo_archivo,
      datos_imagen: img.ruta_imagen ? await getImageUrl(img.ruta_imagen) : '',
      ruta_imagen: img.ruta_imagen ? await getImageUrl(img.ruta_imagen) : '',
      fecha_creacion: img.fecha_creacion
    })))
    
    return processedImages
  } catch (error) {
    console.error(`Error al obtener imágenes para la orden ${ordenId}:`, error)
    return []
  }
}

export async function deleteOrderImage(imageId: number): Promise<boolean> {
  try {
    const image = await prisma.imagenes_ordenes.findUnique({
      where: { id: imageId },
      select: { ruta_imagen: true, orden_id: true }
    })
    
    if (image && image.ruta_imagen) {
      if (process.env.NODE_ENV === 'development') {
        // In development, use direct file system operations
        const filePath = path.join(process.cwd(), "public", image.ruta_imagen)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } else {
        // In production, use the API route with absolute URL
        const imagePath = image.ruta_imagen.startsWith('/') 
          ? image.ruta_imagen.substring(1) 
          : image.ruta_imagen;
          
        // Usar la función safeFetch para manejar la petición de manera segura
        await safeFetch(`/api/filesystem?path=${encodeURIComponent(imagePath)}&isFile=true`, {
          method: 'DELETE',
        });
      }
    }
    
    await prisma.imagenes_ordenes.delete({
      where: { id: imageId }
    })
    
    revalidatePath("/dashboard/manage-orders")
    return true
  } catch (error) {
    console.error(`Error al eliminar la imagen ${imageId}:`, error)
    return false
  }
}

export async function deleteOrderImagesForOrder(orderId: number): Promise<boolean> {
  try {
    const images = await getOrderImages(orderId)
    
    // Delete image files
    for (const image of images) {
      if (image.ruta_imagen && !image.ruta_imagen.startsWith('data:')) {
        try {
          if (process.env.NODE_ENV === 'development') {
            // In development, use direct file system operations
            const filePath = path.join(process.cwd(), "public", image.ruta_imagen)
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
            }
          } else {
            // In production, use the API route with absolute URL
            const imagePath = image.ruta_imagen.startsWith('/') 
              ? image.ruta_imagen.substring(1) 
              : image.ruta_imagen;
              
            // Usar la función safeFetch para manejar la petición de manera segura
            await safeFetch(`/api/filesystem?path=${encodeURIComponent(imagePath)}&isFile=true`, {
              method: 'DELETE',
            });
          }
        } catch (fileError) {
          console.error(`Error deleting image file for image ID ${image.id}:`, fileError)
        }
      }
    }
    
    // Delete the order's folder after deleting all images
    if (process.env.NODE_ENV === 'development') {
      // In development, try to delete the directory directly
      const dirPath = path.join(process.cwd(), "public", "uploads", orderId.toString())
      if (fs.existsSync(dirPath)) {
        try {
          const files = fs.readdirSync(dirPath)
          if (files.length === 0) {
            fs.rmdirSync(dirPath)
          }
        } catch (dirError) {
          console.error(`Error deleting directory for order ID ${orderId}:`, dirError)
        }
      }
    } else {
      // In production, use the API route with absolute URL
      // Usar la función safeFetch para manejar la petición de manera segura
      await safeFetch(`/api/filesystem?path=${encodeURIComponent(`uploads/${orderId}`)}&isFile=false`, {
        method: 'DELETE',
      });
    }
    
    // Delete database records
    await prisma.imagenes_ordenes.deleteMany({
      where: { orden_id: orderId }
    })
    
    revalidatePath("/dashboard/manage-orders")
    return true
  } catch (error) {
    console.error("Error al eliminar imágenes de la orden:", error)
    throw new Error("No se pudieron eliminar las imágenes asociadas a la orden")
  }
}
