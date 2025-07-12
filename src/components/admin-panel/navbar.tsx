import { SheetMenu } from '@/components/admin-panel/sheet-menu';
import { UserNav } from '@/components/admin-panel/user-nav';
import { ModeToggle } from '@/components/mode-toggle';
import LanguageToggle from '../language-toggle';
import RefreshButton from '../refresh-button';

interface NavbarProps {
  title: string;
  breadcrumb?: React.ReactNode;
}

export function Navbar({ title, breadcrumb }: NavbarProps) {
  return (
    <header
      className='sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur
        supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary'
    >
      <div className='mx-4 sm:mx-8 flex h-14 items-center'>
        <div className='flex items-center space-x-4 lg:space-x-0'>
          <SheetMenu />
          {breadcrumb ? breadcrumb : <h1 className='font-bold'>{title}</h1>}
        </div>
        <div className='flex flex-1 items-center justify-end gap-2'>
          <RefreshButton />
          <LanguageToggle />
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
