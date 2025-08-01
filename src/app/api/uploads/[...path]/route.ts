import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
    
    // Remove /api/v1 from the end if present to get the base URL
    const baseUrl = backendUrl.replace(/\/api\/v\d+$/, '');
    const imageUrl = `${baseUrl}/uploads/${path}`;

    console.log('Proxying image request:', imageUrl);

    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText);
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
