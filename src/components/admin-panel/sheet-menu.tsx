import Link from 'next/link';
import { MenuIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Menu } from '../../../menu';
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle
} from '@/components/ui/sheet';
import Image from 'next/image';

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className='lg:hidden' asChild>
        <Button className='h-8' variant='outline' size='icon'>
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent
        className='sm:w-72 px-3 h-full flex flex-col gap-0'
        side='left'
      >
        <SheetHeader className='items-start'>
          <Button
            className='flex justify-start items-center pb-2 pt-1 pl-1'
            variant='link'
            asChild
          >
            <Link href='/admin/dashboard' className='flex items-center gap-2'>
              <Image
                src='/assets/image/logo.png'
                width={50}
                height={50}
                alt='logo'
                className='w-6 h-6 mr-1'
              />
              <SheetTitle className='font-bold text-lg text-primary'>
                SmartGrade UCSH
              </SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
