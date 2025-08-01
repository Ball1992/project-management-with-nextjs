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
        error: 'Work Order ID is required' 
      },
      { status: 400 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const jwtToken = searchParams.get('jwtToken');

    if (!jwtToken) {
      console.error('API Route: JWT Token is missing from request');
      return NextResponse.json(
        { 
          success: false, 
          error: 'JWT Token is required' 
        },
        { status: 400 }
      );
    }

    console.log('API Route: Starting handover documents download for work order ID:', id);
    console.log('API Route: JWT Token present:', !!jwtToken);
    console.log('API Route: Request URL:', request.url);
    
    const fileData = await MemberService.GetHandOverDocumentsDownload(id, jwtToken);
    
    console.log('API Route: File data received, type:', typeof fileData);
    console.log('API Route: File data structure:', Object.keys(fileData || {}));
    
    // Handle FileContentResult structure from updated Salesforce Gateway
    let buffer: Buffer;
    let contentType: string = 'application/pdf'; // Default to PDF for handover documents
    let fileName: string = `handover_documents_${id}.pdf`;
    
    if (fileData && typeof fileData === 'object') {
      // Check for FileContentResult structure (from updated Salesforce Gateway)
      if (fileData.fileContents && fileData.contentType && fileData.fileDownloadName) {
        console.log('API Route: FileContentResult detected from updated Salesforce Gateway');
        
        contentType = fileData.contentType;
        fileName = fileData.fileDownloadName;
        
        // Handle different types of fileContents from the updated gateway
        if (fileData.fileContents instanceof ArrayBuffer) {
          console.log('API Route: FileContents is ArrayBuffer (binary data preserved)');
          buffer = Buffer.from(fileData.fileContents);
        } else if (Buffer.isBuffer(fileData.fileContents)) {
          console.log('API Route: FileContents is Buffer (binary data preserved)');
          buffer = fileData.fileContents;
        } else if (typeof fileData.fileContents === 'object' && fileData.fileContents.type === 'Buffer') {
          // Handle serialized Buffer object from JSON
          console.log('API Route: FileContents is serialized Buffer object');
          buffer = Buffer.from(fileData.fileContents.data);
        } else {
          console.log('API Route: FileContents is other type, converting to buffer');
          buffer = Buffer.from(fileData.fileContents);
        }
        
        console.log('API Route: FileContentResult - Content Type:', contentType);
        console.log('API Route: FileContentResult - File Name:', fileName);
        console.log('API Route: FileContentResult - Buffer size:', buffer.length);
      }
      // Handle direct binary data response (ArrayBuffer from updated gateway)
      else if (fileData instanceof ArrayBuffer) {
        console.log('API Route: Direct ArrayBuffer detected from updated gateway');
        buffer = Buffer.from(fileData);
        fileName = searchParams.get('filename') || fileName;
        contentType = getContentTypeFromFileName(fileName);
      }
      // Handle serialized Buffer object
      else if (fileData.type === 'Buffer' && Array.isArray(fileData.data)) {
        console.log('API Route: Serialized Buffer object detected');
        buffer = Buffer.from(fileData.data);
        fileName = searchParams.get('filename') || fileName;
        contentType = getContentTypeFromFileName(fileName);
      }
      // Handle other object structures (fallback for compatibility)
      else {
        console.log('API Route: Unknown object structure, attempting conversion');
        console.log('API Route: Object keys:', Object.keys(fileData));
        
        // Try to convert object to buffer (might be array-like object)
        if (Object.keys(fileData).every(key => !isNaN(Number(key)))) {
          console.log('API Route: Array-like object detected');
          const arrayValues = Object.values(fileData) as number[];
          buffer = Buffer.from(arrayValues);
        } else {
          // Try to find data in common fields
          const dataField = fileData.data || fileData.content || fileData.base64 || fileData.fileData || fileData.file;
          if (dataField) {
            console.log('API Route: Found data in object field');
            if (typeof dataField === 'string') {
              try {
                buffer = Buffer.from(dataField, 'base64');
              } catch (error) {
                buffer = Buffer.from(dataField, 'utf8');
              }
            } else if (dataField instanceof ArrayBuffer) {
              buffer = Buffer.from(dataField);
            } else if (Buffer.isBuffer(dataField)) {
              buffer = dataField;
            } else if (Array.isArray(dataField)) {
              buffer = Buffer.from(dataField);
            } else {
              buffer = Buffer.from(dataField);
            }
          } else {
            console.error('API Route: Unable to find file data in object');
            throw new Error('Unable to extract file data from response');
          }
        }
        fileName = searchParams.get('filename') || fileName;
        contentType = getContentTypeFromFileName(fileName);
      }
    }
    // Handle direct buffer response
    else if (Buffer.isBuffer(fileData)) {
      console.log('API Route: Direct Buffer detected');
      buffer = fileData;
      fileName = searchParams.get('filename') || fileName;
      contentType = getContentTypeFromFileName(fileName);
    }
    // Handle direct ArrayBuffer response
    else if (fileData instanceof ArrayBuffer) {
      console.log('API Route: Direct ArrayBuffer response detected');
      buffer = Buffer.from(fileData);
      fileName = searchParams.get('filename') || fileName;
      contentType = getContentTypeFromFileName(fileName);
    }
    // Handle string response (fallback for old gateway)
    else if (typeof fileData === 'string') {
      console.log('API Route: String response detected (fallback for old gateway)');
      fileName = searchParams.get('filename') || fileName;
      contentType = getContentTypeFromFileName(fileName);
      
      try {
        // Try base64 first
        buffer = Buffer.from(fileData, 'base64');
        console.log('API Route: Successfully decoded as base64');
      } catch (error) {
        console.log('API Route: Base64 decode failed, trying as latin1');
        buffer = Buffer.from(fileData, 'latin1');
      }
    }
    else {
      console.error('API Route: Unsupported file data type:', typeof fileData);
      console.error('API Route: File data value:', fileData);
      throw new Error('Unsupported file data format received from API');
    }
    
    // Validate that we have actual file data
    if (!buffer || buffer.length === 0) {
      console.error('API Route: File buffer is empty or null');
      return NextResponse.json(
        { 
          success: false, 
          error: 'File data is empty or invalid' 
        },
        { status: 404 }
      );
    }
    
    // Validate file integrity by checking magic bytes if possible
    const detectedContentType = detectContentTypeFromBuffer(buffer);
    if (detectedContentType && detectedContentType !== contentType) {
      console.log('API Route: Content type mismatch detected');
      console.log('API Route: Original content type:', contentType);
      console.log('API Route: Detected content type:', detectedContentType);
      // Use detected content type if it's more specific
      contentType = detectedContentType;
    }
    
    console.log('API Route: Final response - Content Type:', contentType);
    console.log('API Route: Final response - File Name:', fileName);
    console.log('API Route: Final response - Buffer Size:', buffer.length);
    console.log('API Route: First 16 bytes (hex):', buffer.subarray(0, 16).toString('hex'));
    
    // Ensure we don't accidentally return JSON content type for binary data
    if (contentType === 'application/json' || contentType.includes('json')) {
      console.log('API Route: Detected JSON content type for binary data, correcting to PDF');
      contentType = 'application/pdf';
    }
    
    // Ensure filename has proper extension based on content type
    fileName = ensureFileExtension(fileName, contentType, searchParams);
    
    console.log('API Route: Final filename with extension:', fileName);
    
    // Return the file data as a blob response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('WorkOrder Handover Documents Download API Error:', error);
    console.error('Error stack:', error.stack);
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

// Helper function to detect content type based on file extension and magic bytes
function getContentTypeFromFileName(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();
  
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'gif': return 'image/gif';
    case 'bmp': return 'image/bmp';
    case 'webp': return 'image/webp';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls': return 'application/vnd.ms-excel';
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'ppt': return 'application/vnd.ms-powerpoint';
    case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'txt': return 'text/plain';
    case 'csv': return 'text/csv';
    case 'zip': return 'application/zip';
    case 'rar': return 'application/x-rar-compressed';
    case '7z': return 'application/x-7z-compressed';
    case 'mp4': return 'video/mp4';
    case 'avi': return 'video/x-msvideo';
    case 'mov': return 'video/quicktime';
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    default: return 'application/pdf'; // Default to PDF for handover documents
  }
}

// Helper function to detect content type from buffer magic bytes
function detectContentTypeFromBuffer(buffer: Buffer): string | null {
  if (buffer.length < 4) {
    return null;
  }

  const header = buffer.subarray(0, 16);
  
  // PDF
  if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) {
    return 'application/pdf';
  }
  
  // JPEG
  if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
    return 'image/jpeg';
  }
  
  // PNG
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
    return 'image/png';
  }
  
  // GIF
  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
    return 'image/gif';
  }
  
  // BMP
  if (header[0] === 0x42 && header[1] === 0x4D) {
    return 'image/bmp';
  }
  
  // ZIP (and Office documents)
  if (header[0] === 0x50 && header[1] === 0x4B) {
    // Check for Office document signatures
    if (buffer.length > 30) {
      const content = buffer.toString('ascii', 0, Math.min(buffer.length, 100));
      if (content.includes('word/')) {
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
      if (content.includes('xl/')) {
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }
      if (content.includes('ppt/')) {
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      }
    }
    return 'application/zip';
  }
  
  // RAR
  if (header[0] === 0x52 && header[1] === 0x61 && header[2] === 0x72 && header[3] === 0x21) {
    return 'application/x-rar-compressed';
  }
  
  // 7Z
  if (header[0] === 0x37 && header[1] === 0x7A && header[2] === 0xBC && header[3] === 0xAF) {
    return 'application/x-7z-compressed';
  }
  
  // MP4
  if (buffer.length > 8 && header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) {
    return 'video/mp4';
  }
  
  // MP3
  if ((header[0] === 0xFF && (header[1] & 0xE0) === 0xE0) || 
      (header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33)) {
    return 'audio/mpeg';
  }
  
  // WAV
  if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
      header[8] === 0x57 && header[9] === 0x41 && header[10] === 0x56 && header[11] === 0x45) {
    return 'audio/wav';
  }
  
  // Old Office documents
  if (header[0] === 0xD0 && header[1] === 0xCF && header[2] === 0x11 && header[3] === 0xE0) {
    // This is a compound document, could be old Office format
    return 'application/msword'; // Default to Word, could be Excel or PowerPoint
  }
  
  return null;
}

// Helper function to ensure filename has proper extension based on content type
function ensureFileExtension(fileName: string, contentType: string, searchParams: URLSearchParams): string {
  console.log('ensureFileExtension: Input fileName:', fileName);
  console.log('ensureFileExtension: Input contentType:', contentType);
  
  // Check if filename already has an extension
  const hasExtension = fileName.includes('.') && fileName.split('.').pop()!.length > 0;
  
  if (hasExtension) {
    console.log('ensureFileExtension: File already has extension, returning as-is');
    return fileName; // Already has extension
  }
  
  // Try to extract filename from query parameter first (might have the original filename)
  const originalFilename = searchParams.get('filename');
  if (originalFilename && originalFilename.includes('.')) {
    console.log('ensureFileExtension: Using original filename from URL:', originalFilename);
    return originalFilename;
  }
  
  // Add appropriate extension based on content type
  let extension = '';
  
  switch (contentType) {
    case 'application/pdf':
      extension = '.pdf';
      break;
    case 'image/jpeg':
      extension = '.jpg';
      break;
    case 'image/png':
      extension = '.png';
      break;
    case 'image/gif':
      extension = '.gif';
      break;
    case 'image/bmp':
      extension = '.bmp';
      break;
    case 'image/webp':
      extension = '.webp';
      break;
    case 'application/msword':
      extension = '.doc';
      break;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      extension = '.docx';
      break;
    case 'application/vnd.ms-excel':
      extension = '.xls';
      break;
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      extension = '.xlsx';
      break;
    case 'application/vnd.ms-powerpoint':
      extension = '.ppt';
      break;
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      extension = '.pptx';
      break;
    case 'text/plain':
      extension = '.txt';
      break;
    case 'text/csv':
      extension = '.csv';
      break;
    case 'application/zip':
      extension = '.zip';
      break;
    case 'application/x-rar-compressed':
      extension = '.rar';
      break;
    case 'application/x-7z-compressed':
      extension = '.7z';
      break;
    case 'video/mp4':
      extension = '.mp4';
      break;
    case 'video/x-msvideo':
      extension = '.avi';
      break;
    case 'video/quicktime':
      extension = '.mov';
      break;
    case 'audio/mpeg':
      extension = '.mp3';
      break;
    case 'audio/wav':
      extension = '.wav';
      break;
    default:
      // For handover documents, default to PDF
      extension = '.pdf';
      break;
  }
  
  const result = fileName + extension;
  console.log('ensureFileExtension: Final result:', result);
  return result;
}
