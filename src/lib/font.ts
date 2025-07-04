import {
  Geist,
  Geist_Mono,
  Instrument_Sans,
  Inter,
  Mulish,
  Noto_Sans_Mono
} from 'next/font/google';
import localFont from 'next/font/local';

import { cn } from '@/lib/utils';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  preload: false
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  preload: false
});

const fontInstrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
  preload: false
});

const fontNotoMono = Noto_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-noto-mono',
  preload: false
});

const fontMullish = Mulish({
  subsets: ['latin'],
  variable: '--font-mullish',
  preload: false
});

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  preload: false
});

export const myanmarFont = localFont({
  src: '../../public/assets/font/MyanmarSagar.ttf',
  variable: '--font-myanmar',
  preload: false
});

export const fontVariables = cn(
  fontSans.variable,
  fontInstrument.variable,
  fontMullish.variable,
  fontInter.variable,
  fontNotoMono.variable,
  fontMono.variable,
  myanmarFont.variable
);
