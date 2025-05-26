import type { Metadata, Viewport } from 'next';

import { ThemeProvider } from '@/components/providers/theme-provider';
import AuthProvider from '@/components/providers/auth-provider';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import NextTopLoader from 'nextjs-toploader';
import { cookies } from 'next/headers';
import { fontVariables } from '@/lib/font';
import { cn } from '@/lib/utils';

import '../theme.css';
import '../globals.css';
import { Toaster } from 'sonner';
import { hasLocale, Locale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata(props: Omit<Props, 'children'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'LocaleLayout' });

  let baseUrl: string;
  if (process.env.APP_URL) {
    baseUrl = process.env.APP_URL;
  } else if (process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
  } else if (typeof window === 'undefined') {
    // Only fallback in development/server
    baseUrl = `http://localhost:${process.env.PORT || 3000}`;
  } else {
    throw new Error(
      'APP_URL or VERCEL_URL must be defined in the environment.'
    );
  }

  return {
    metadataBase: new URL(baseUrl),
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: '/'
    },
    openGraph: {
      url: '/',
      title: t('title'),
      description: t('description'),
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description')
    }
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isScaled = activeThemeValue?.endsWith('-scaled');

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          'font-sans antialiased',
          activeThemeValue ? `theme-${activeThemeValue}` : '',
          isScaled ? 'theme-scaled' : '',
          fontVariables
        )}
      >
        <NextTopLoader showSpinner={false} />
        <NextIntlClientProvider>
          <NuqsAdapter>
            <ThemeProvider
              activeThemeValue={activeThemeValue as string}
              attribute='class'
              defaultTheme='system'
              enableSystem
            >
              <AuthProvider>{children}</AuthProvider>
            </ThemeProvider>
          </NuqsAdapter>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
