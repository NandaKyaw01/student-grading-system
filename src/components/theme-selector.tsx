'use client';

import { useThemeConfig } from '@/components/active-theme';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';

const DEFAULT_THEMES = [
  {
    name: 'Default',
    value: 'default'
  },
  {
    name: 'Blue',
    value: 'blue'
  },
  {
    name: 'Green',
    value: 'green'
  },
  {
    name: 'Amber',
    value: 'amber'
  }
];

const SCALED_THEMES = [
  {
    name: 'Default',
    value: 'default-scaled'
  },
  {
    name: 'Blue',
    value: 'blue-scaled'
  }
];

const MONO_THEMES = [
  {
    name: 'Mono',
    value: 'mono-scaled'
  }
];

type ThemeKeys = 'default' | 'blue' | 'green' | 'amber';
type ScaleThemeKeys = 'default-scaled' | 'blue-scaled' | 'mono-scaled';

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig();
  const t = useTranslations('SettingPage.theme_selector');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='inline-block'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='theme-selector' className='sr-only'>
                {t('label')}
              </Label>
              <Select value={activeTheme} onValueChange={setActiveTheme}>
                <SelectTrigger
                  id='theme-selector'
                  className='justify-start *:data-[slot=select-value]:w-12'
                >
                  <span className='text-muted-foreground hidden sm:block'>
                    {t('select_a_theme')}:
                  </span>
                  <span className='text-muted-foreground block sm:hidden'>
                    {t('label')}
                  </span>
                  <SelectValue placeholder={t('placeholder')} />
                </SelectTrigger>
                <SelectContent align='end'>
                  <SelectGroup>
                    <SelectLabel>{t('default_themes')}</SelectLabel>
                    {DEFAULT_THEMES.map((theme) => (
                      <SelectItem key={theme.name} value={theme.value}>
                        {t(`themes.${theme.value as ThemeKeys}`)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>{t('scaled_themes')}</SelectLabel>
                    {SCALED_THEMES.map((theme) => (
                      <SelectItem key={theme.name} value={theme.value}>
                        {t(`themes.${theme.value as ScaleThemeKeys}`)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t('mono_themes')}</SelectLabel>
                    {MONO_THEMES.map((theme) => (
                      <SelectItem key={theme.name} value={theme.value}>
                        {t(`themes.${theme.value as ScaleThemeKeys}`)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('tooltip')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
