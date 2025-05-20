import { NextRequest, NextResponse } from 'next/server';
import { localizationMiddleware } from './i18n/localization-middleware';
import { withAuth } from 'next-auth/middleware';
import { i18n } from './i18n/i18n-config';
import { getToken } from 'next-auth/jwt';

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};

const publicPages = ['/', '/auth/login', '/api/register'];

const authMiddleware = withAuth(
  function onSuccess(req) {
    return localizationMiddleware(req);
  },
  {
    // callbacks: {
    //   authorized: ({ token }) => token != null
    // },
    callbacks: {
      authorized: async ({ req }) => {
        const session = await getToken({
          req,
          secret: process.env.NEXTAUTH_SECRET
        });

        return !!session;
      }
    },
    pages: {
      signIn: '/auth/login'
    }
  }
);

export default function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^(/(${i18n.locales.join('|')}))?(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return localizationMiddleware(req);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (authMiddleware as any)(req);
  }
}
