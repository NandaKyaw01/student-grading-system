'use client';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { Button } from './ui/button';
import { useSwitchLocaleHref } from '@/features/internationalization/use-switch-locale-href';
import Link from 'next/link';
import { i18n, localeName } from '@/features/internationalization/i18n-config';

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
            <Link href={getSwitchLocaleHref(locale)} key={locale}>
              <DropdownMenuItem className='cursor-pointer'>
                <span className='mr-1'>{locale.toUpperCase()}</span>
                {localeName[locale]}
              </DropdownMenuItem>
            </Link>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
