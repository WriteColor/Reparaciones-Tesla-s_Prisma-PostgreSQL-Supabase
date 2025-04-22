import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruir la ruta de la imagen desde los parámetros
    const imagePath = params.path.join('/');
    
    // Construir la ruta completa al archivo en el sistema
    const filePath = path.join(process.cwd(), 'public', 'uploads', imagePath);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Imagen no encontrada', { status: 404 });
    }
    
    // Leer el archivo
    const fileBuffer = fs.readFileSync(filePath);
    
    // Determinar el tipo MIME basado en la extensión del archivo
    const extension = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream'; // Por defecto
    
    // Mapear extensiones comunes a tipos MIME
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp',
      '.svg': 'image/svg+xml',
    };
    
    if (extension in mimeTypes) {
      contentType = mimeTypes[extension];
    }
    
    // Configurar headers para caché y tipo de contenido
    const headersList = new Headers();
    headersList.set('Content-Type', contentType);
    headersList.set('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año
    
    // Devolver la imagen con los headers adecuados
    return new NextResponse(fileBuffer, {
      headers: headersList,
      status: 200,
    });
  } catch (error) {
    console.error('Error al servir la imagen:', error);
    return new NextResponse('Error al procesar la imagen', { status: 500 });
  }
}