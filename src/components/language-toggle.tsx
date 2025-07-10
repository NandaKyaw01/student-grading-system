'use client';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { Button } from './ui/button';
import { Locale, useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { routing } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

const LanguageToggle = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  function onSelectChange(cur: Locale) {
    const nextLocale = cur as Locale;

    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: nextLocale }
      );
      router.refresh();
    });
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <div className='inline-block'>
          <div className='flex items-center gap-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant='ghost'>
                    <Languages className='w-5 h-5' />
                    <span className='sr-only'>Toggle language</span>
                  </Button>
                </TooltipTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='min-w-min'>
                {routing.locales.map((cur) => {
                  return (
                    <DropdownMenuCheckboxItem
                      checked={locale === cur}
                      onClick={() => onSelectChange(cur)}
                      disabled={isPending}
                      className='cursor-pointer'
                      key={cur}
                    >
                      {t('locale', { locale: cur })}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TooltipContent>
          <p>Switch Language</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LanguageToggle;
