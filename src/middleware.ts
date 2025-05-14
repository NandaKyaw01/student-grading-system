import { NextRequest } from 'next/server';
import { localizationMiddleware } from './features/internationalization/localization-middleware';

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico).*)']
};

export function middleware(request: NextRequest) {
  return localizationMiddleware(request);
}
