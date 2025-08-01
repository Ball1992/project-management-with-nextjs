import { NextRequest, NextResponse } from 'next/server';
import { MemberService } from '../../../../../../services/MemberService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Attachment ID is required' 
      },
      { status: 400 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const jwtToken = searchParams.get('jwtToken');

    if (!jwtToken) {
      console.error('API Route Preview: JWT Token is missing from request');
      return NextResponse.json(
        { 
          success: false, 
          error: 'JWT Token is required' 
        },
        { status: 400 }
      );
    }

    console.log('API Route Preview: Starting preview for attachment ID:', id);
    
    const fileData = await MemberService.GetWorkOrderAttachmentDownload(id, jwtToken);
    
    console.log('API Route Preview: File data received, type:', typeof fileData);
    
    // Handle FileContentResult structure from updated Salesforce Gateway
    let buffer: Buffer;
    let contentType: string = 'application/octet-stream';
    let fileName: string = `attachment_${id}`;
    
    if (fileData && typeof fileData === 'object') {
      // Check for FileContentResult structure (from updated Salesforce Gateway)
      if (fileData.fileContents && fileData.contentType && fileData.fileDownloadName) {
        console.log('API Route Preview: FileContentResult detected');
        
        contentType = fileData.contentType;
        fileName = fileData.fileDownloadName;
        
        // Handle different types of fileContents from the updated gateway
        if (fileData.fileContents instanceof ArrayBuffer) {
          buffer = Buffer.from(fileData.fileContents);
        } else if (Buffer.isBuffer(fileData.fileContents)) {
          buffer = fileData.fileContents;
        } else if (typeof fileData.fileContents === 'object' && fileData.fileContents.type === 'Buffer') {
          buffer = Buffer.from(fileData.fileContents.data);
        } else {
          buffer = Buffer.from(fileData.fileContents);
        }
      } else {
        // Handle other formats
        buffer = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData);
      }
    } else {
      buffer = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData);
    }
    
    // Validate that we have actual file data
    if (!buffer || buffer.length === 0) {
      console.error('API Route Preview: File buffer is empty or null');
      return NextResponse.json(
        { 
          success: false, 
          error: 'File data is empty or invalid' 
        },
        { status: 404 }
      );
    }
    
    // Check if it's an image by content type or magic bytes
    const isImage = isImageFile(buffer, contentType);
    
    if (!isImage) {
      console.log('API Route Preview: File is not an image, returning error');
      return NextResponse.json(
        { 
          success: false, 
          error: 'File is not an image' 
        },
        { status: 400 }
      );
    }
    
    console.log('API Route Preview: Returning image preview');
    console.log('API Route Preview: Content Type:', contentType);
    console.log('API Route Preview: Buffer Size:', buffer.length);
    
    // Return the image data for preview
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('WorkOrder Attachment Preview API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to check if file is an image
function isImageFile(buffer: Buffer, contentType: string): boolean {
  // Check content type first
  if (contentType && contentType.startsWith('image/')) {
    return true;
  }
  
  // Check magic bytes for common image formats
  if (buffer.length < 4) {
    return false;
  }

  const header = buffer.subarray(0, 16);
  
  // JPEG
  if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
    return true;
  }
  
  // PNG
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
    return true;
  }
  
  // GIF
  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
    return true;
  }
  
  // BMP
  if (header[0] === 0x42 && header[1] === 0x4D) {
    return true;
  }
  
  // WebP
  if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
      header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50) {
    return true;
  }
  
  return false;
}
