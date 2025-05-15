import { NextRequest } from 'next/server';
import { localizationMiddleware } from './i18n/localization-middleware';

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  // matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico).*)']
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};

export function middleware(request: NextRequest) {
  return localizationMiddleware(request);
}
