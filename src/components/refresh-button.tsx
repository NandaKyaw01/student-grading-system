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

const RefreshButton = () => {
  const [isPending, startTransition] = useTransition();

  const handleRefresh = useCallback(() => {
    startTransition(async () => {
      await refreshAll();
    });
    window.location.reload();
  }, []);

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
        <TooltipContent side='bottom'>Refresh All</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RefreshButton;
