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
  variable: '--font-sans'
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
});

const fontInstrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument'
});

const fontNotoMono = Noto_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-noto-mono'
});

const fontMullish = Mulish({
  subsets: ['latin'],
  variable: '--font-mullish'
});

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const myanmarFont = localFont({
  src: '../../public/assets/font/MyanmarSagar.ttf',
  variable: '--font-myanmar'
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
