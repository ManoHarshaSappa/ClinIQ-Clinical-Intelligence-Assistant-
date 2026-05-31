import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Force fresh requests for patient pages to avoid extension/cache conflicts
  if (request.nextUrl.pathname.includes('/patients/') && !request.nextUrl.pathname.includes('/api/')) {
    const response = NextResponse.next();

    // Add aggressive cache-busting headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    // Add timestamp to prevent extension interference
    response.headers.set('X-Timestamp', Date.now().toString());

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/patients/:path*',
    '/api/patients/:path*'
  ],
};