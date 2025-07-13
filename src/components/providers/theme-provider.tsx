'use client';

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps
} from 'next-themes';
import { ActiveThemeProvider } from '../active-theme';
import { Toaster } from '../ui/sonner';

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
      <Toaster
        theme={activeThemeValue === 'dark' ? 'dark' : 'light'}
        closeButton
      />
    </NextThemesProvider>
  );
}
