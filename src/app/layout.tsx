import { ReactNode } from 'react';
import './globals.css';
import { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: [
    "smartgrade ucsh",
    "ucsh",
    "smartgrade",
    "university of computer studies",
    "university of computer studies, hinthada",
    "hinthada",
    "grading certificate information system",
  ],
  authors: [
    {
      name: "ucsh",
      url: "https://ucsh.edu.mm",
    },
  ],
  creator: "ucsh",
  openGraph: {
    url: new URL(siteConfig.url).toString(),
    title: siteConfig.name,
    description: siteConfig.description,
    type: 'website',
    siteName: siteConfig.name
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: new URL(`/og.jpg`, siteConfig.url)
  },
  icons: {
    icon: "/icon.png",
  },
  manifest: new URL(`/site.webmanifest`, siteConfig.url),
};


// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: Props) {
  return children;
}
