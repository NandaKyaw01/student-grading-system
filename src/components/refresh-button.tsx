'use client';

import { refreshAll } from '@/actions/academic-year';
import { Loader, RefreshCcw } from 'lucide-react';
import { useCallback, useTransition } from 'react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

const RefreshButton = () => {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('NavBar');
  const pathname = usePathname()

  const handleRefresh = useCallback(() => {
    startTransition(async () => {
      await refreshAll();
    });
    window.location.reload();
  }, []);

  if (pathname === "/en/search" || pathname === "/mm/search") return null;

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            size='icon'
            className='rounded-full w-8 h-8 bg-background'
            variant='outline'
            onClick={handleRefresh}
          >
            {isPending ? <Loader className='animate-spin' /> : <RefreshCcw />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>{t('refresh_tooltip')}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RefreshButton;
