'use client';

import Link from 'next/link';
import { LayoutGrid, LogOut, User, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export function UserNav() {
  const t = useTranslations('UserNav');
  const { data: session, status } = useSession();
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const tForTooltip = useTranslations('NavBar');

  const pathname = usePathname();

  // Get user info from session
  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const userImage = session?.user?.image;

  // Reset loading state when userImage changes
  useEffect(() => {
    if (userImage) {
      setIsImageLoading(true);
      setImageError(false);
    } else {
      setIsImageLoading(false);
      setImageError(false);
    }
  }, [userImage]);

  // Create fallback initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return (
      <Button
        variant='outline'
        className='relative h-8 w-8 rounded-full'
        disabled
      >
        <Avatar className='h-8 w-8'>
          <AvatarFallback className='bg-transparent'>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  if (pathname === "/en/search" || pathname === "/mm/search") return null;

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='relative h-8 w-8 rounded-full'
              >
                <Avatar className='h-8 w-8'>
                  {!imageError && userImage && (
                    <AvatarImage
                      src={userImage || '#'}
                      alt='Avatar'
                      onLoad={() => setIsImageLoading(false)}
                      onError={() => {
                        setIsImageLoading(false);
                        setImageError(true);
                      }}
                    />
                  )}
                  <AvatarFallback className='bg-transparent'>
                    {isImageLoading && userImage && !imageError ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      getInitials(userName)
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side='bottom'>
            {tForTooltip('profile_tooltip')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{userName}</p>
            {userEmail && (
              <p className='text-xs leading-none text-muted-foreground'>
                {userEmail}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className='hover:cursor-pointer' asChild>
            <Link href='/admin/dashboard' className='flex items-center'>
              <LayoutGrid className='w-4 h-4 mr-3 text-muted-foreground' />
              {t('dashboard')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className='hover:cursor-pointer' asChild>
            <Link href='/admin/account' className='flex items-center'>
              <User className='w-4 h-4 mr-3 text-muted-foreground' />
              {t('account')}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='hover:cursor-pointer'
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className='w-4 h-4 mr-3 text-muted-foreground' />
          {t('sign_out')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
