import { NextRequest, NextResponse } from 'next/server';

// Configure edge runtime for better caching
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      // Add cache control to the fetch request
      headers: {
        'User-Agent': 'ArcForge/1.0',
      },
    });
    
    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/webp';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        // Aggressive caching - images are immutable
        'Cache-Control': 'public, max-age=31536000, immutable, s-maxage=31536000, stale-while-revalidate=31536000',
        // Add CDN cache tags for Vercel
        'CDN-Cache-Control': 'max-age=31536000',
        'Vercel-CDN-Cache-Control': 'max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}

