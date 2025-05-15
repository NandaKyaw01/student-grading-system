import type { Metadata, Viewport } from 'next';

import { ThemeProvider } from '@/components/providers/theme-provider';
import NextTopLoader from 'nextjs-toploader';
import { Locale } from '@/i18n/i18n-config';
import { cookies } from 'next/headers';
import { fontVariables } from '@/lib/font';
import { cn } from '@/lib/utils';

import '../globals.css';
import '../theme.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_URL
      ? `${process.env.APP_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${process.env.PORT || 3000}`
  ),
  title: 'SmartGrade UCSH',
  description:
    'Simplifying Student Grading & Evaluation System at University of Computer Studies, Hinthada',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    url: '/',
    title: 'SmartGrade UCSH',
    description:
      'Simplifying Student Grading & Evaluation System at University of Computer Studies, Hinthada',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartGrade UCSH',
    description:
      'Simplifying Student Grading & Evaluation System at University of Computer Studies, Hinthada'
  }
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'mm' }];
}

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { children } = props;

  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isScaled = activeThemeValue?.endsWith('-scaled');

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <body
        className={cn(
          'font-sans antialiased',
          activeThemeValue ? `theme-${activeThemeValue}` : '',
          isScaled ? 'theme-scaled' : '',
          fontVariables
        )}
      >
        <NextTopLoader showSpinner={false} />
        <ThemeProvider
          activeThemeValue={activeThemeValue as string}
          attribute='class'
          defaultTheme='system'
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
