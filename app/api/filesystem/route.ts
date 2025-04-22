import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { headers } from 'next/headers';

// Add CORS headers to make the API accessible from any domain
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  const response = NextResponse.json({});
  return addCorsHeaders(response);
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderPath = searchParams.get('path');
    const isFile = searchParams.get('isFile') === 'true';
    
    if (!folderPath) {
      const response = NextResponse.json(
        { success: false, error: 'Path parameter is required' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Normalize the path to handle different formats
    const normalizedPath = folderPath.replace(/\\/g, '/').replace(/^\/+/, '');
    
    // Ensure the path is within the uploads directory for security
    const fullPath = path.join(process.cwd(), 'public', normalizedPath);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fullPath.startsWith(uploadsDir)) {
      const response = NextResponse.json(
        { success: false, error: 'Invalid path. Must be within uploads directory' },
        { status: 403 }
      );
      return addCorsHeaders(response);
    }

    if (!fs.existsSync(fullPath)) {
      console.log(`Path does not exist: ${fullPath}`);
      const response = NextResponse.json(
        { success: false, error: 'Path does not exist', path: fullPath },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    if (isFile) {
      // Delete a single file
      fs.unlinkSync(fullPath);
    } else {
      // Delete a directory recursively
      deleteDirectoryRecursive(fullPath);
    }

    const response = NextResponse.json({ 
      success: true,
      message: `Successfully deleted ${isFile ? 'file' : 'directory'}: ${normalizedPath}`
    });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error in filesystem API:', error);
    const response = NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// Helper function to delete a directory recursively
function deleteDirectoryRecursive(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursive call for directories
        deleteDirectoryRecursive(curPath);
      } else {
        // Delete file
        fs.unlinkSync(curPath);
      }
    });
    // Delete the empty directory
    fs.rmdirSync(dirPath);
  }
}