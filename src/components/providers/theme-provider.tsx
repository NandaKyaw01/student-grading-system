'use client';

import * as React from 'react';
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps
} from 'next-themes';
import { ActiveThemeProvider } from '../active-theme';

type ThemeProps = ThemeProviderProps & {
  className?: string;
  activeThemeValue: string;
};

export function ThemeProvider({
  activeThemeValue,
  children,
  ...props
}: ThemeProps) {
  return (
    <NextThemesProvider {...props}>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        {children}
      </ActiveThemeProvider>
    </NextThemesProvider>
  );
}
