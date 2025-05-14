import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';

import '../globals.css';

import { ThemeProvider } from '@/components/providers/theme-provider';
import NextTopLoader from 'nextjs-toploader';
import { Locale } from '@/features/internationalization/i18n-config';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_URL
      ? `${process.env.APP_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${process.env.PORT || 3000}`
  ),
  title: 'shadcn/ui sidebar',
  description:
    'A stunning and functional retractable sidebar for Next.js built on top of shadcn/ui complete with desktop and mobile responsiveness.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    url: '/',
    title: 'shadcn/ui sidebar',
    description:
      'A stunning and functional retractable sidebar for Next.js built on top of shadcn/ui complete with desktop and mobile responsiveness.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'shadcn/ui sidebar',
    description:
      'A stunning and functional retractable sidebar for Next.js built on top of shadcn/ui complete with desktop and mobile responsiveness.'
  }
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'mm' }];
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { children } = props;

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <NextTopLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
