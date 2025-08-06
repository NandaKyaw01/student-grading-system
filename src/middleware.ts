import { withAuth } from 'next-auth/middleware';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const publicPages = [
  '/',
  '/auth/login',
  '/api/register',
  '/uploads/avatars',
  '/search'
];

const intlMiddleware = createMiddleware(routing);

const authMiddleware = withAuth(
  async (req) => {
    const response = intlMiddleware(req);

    const token = req.nextauth.token;

    if (token) {
      const apiUrl = new URL(
        `/api/validate-user/${token.id}`,
        req.nextUrl.origin
      );

      const userResponse = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!userResponse.ok) {
        return NextResponse.redirect('/');
      }

      const user = await userResponse.json();

      if (
        token.updatedAt &&
        user.updatedAt &&
        new Date(token.updatedAt) < new Date(user.updatedAt)
      ) {
        const url = new URL('/auth/login', req.url);
        url.searchParams.set('callbackUrl', req.nextUrl.pathname);
        const cookiePrefix =
          process.env.NODE_ENV === 'production' ? '__Secure-' : '';
        response.cookies.delete(`${cookiePrefix}next-auth.session-token`);
        response.cookies.delete(`${cookiePrefix}next-auth.callback-url`);
        response.cookies.delete(`${cookiePrefix}next-auth.csrf-token`);
        response.cookies.delete(`__Host-next-auth.csrf-token`);
        return NextResponse.redirect(url);
      }
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => token != null
    },
    pages: {
      signIn: '/auth/login'
    }
  }
);

export default function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join('|')}))?(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (authMiddleware as any)(req);
  }
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|uploads|.*\\..*).*)']
};
