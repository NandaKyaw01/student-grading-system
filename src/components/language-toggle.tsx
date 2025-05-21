'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { Button } from './ui/button';
import { useSwitchLocaleHref } from '@/i18n/use-switch-locale-href';
import { i18n, localeName } from '@/i18n/i18n-config';

const COOKIE_NAME = 'active_locale';
function setLocaleCookie(locale: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax; ${window.location.protocol === 'https:' ? 'Secure;' : ''}`;
}

const LanguageToggle = () => {
  const getSwitchLocaleHref = useSwitchLocaleHref();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost'>
          <Languages className='w-5 h-5' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-min'>
        {i18n.locales.map((locale) => {
          return (
            <DropdownMenuItem
              className='cursor-pointer'
              onClick={() => {
                setLocaleCookie(locale);
                window.location.href = getSwitchLocaleHref(locale);
              }}
              key={locale}
            >
              <span className='mr-1 text-xs'>{locale.toUpperCase()}</span>
              {localeName[locale]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
