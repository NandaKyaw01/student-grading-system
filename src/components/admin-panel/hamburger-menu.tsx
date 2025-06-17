'use client';
import { SheetTrigger } from '@/components/ui/sheet';
import { useSidebar } from '@/hooks/use-sidebar';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { MenuIcon } from 'lucide-react';

const HamburgerMenu = () => {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { settings } = sidebar;
  return (
    <SheetTrigger className={settings.disabled ? 'mr-5' : 'lg:hidden'} asChild>
      <Button className='h-8' variant='outline' size='icon'>
        <MenuIcon size={20} />
      </Button>
    </SheetTrigger>
  );
};

export default HamburgerMenu;
