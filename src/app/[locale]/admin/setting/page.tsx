'use client';
import Link from 'next/link';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useSidebar } from '@/hooks/use-sidebar';
import { useStore } from '@/hooks/use-store';
import { Separator } from '@/components/ui/separator';
import { ThemeSelector } from '@/components/theme-selector';
import { useTranslations } from 'next-intl';

type BreadcrumbProps = {
  name: string;
  link: string;
};
const bredcrumb: BreadcrumbProps[] = [
  {
    name: 'Home',
    link: '/'
  },
  {
    name: 'Setting',
    link: ''
  }
];
export default function SettingPage() {
  const t = useTranslations('AdminNavBarTitle');
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { settings, setSettings } = sidebar;
  return (
    <ContentLayout
      title={t('setting')}
      breadcrumb={<ActiveBreadcrumb path={bredcrumb} />}
    >
      <div className='space-y-6'>
        <div>
          <h5 className='text-md font-medium'>Theme</h5>
          <p className='text-sm text-muted-foreground'>
            Select theme to control what&apos;s displayed in the app.
          </p>
        </div>
        <ThemeSelector />

        <Separator />
        <div>
          <h5 className='text-md font-medium'>Sidebar</h5>
          <p className='text-sm text-muted-foreground'>
            Turn items on or off to control what&apos;s displayed in the app.
          </p>
        </div>
        <TooltipProvider>
          <div className='flex gap-6 mt-6'>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='is-hover-open'
                    onCheckedChange={(x) => setSettings({ isHoverOpen: x })}
                    checked={settings.isHoverOpen}
                  />
                  <Label htmlFor='is-hover-open'>Hover Open</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>When hovering on the sidebar in mini state, it will open</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='disable-sidebar'
                    onCheckedChange={(x) => setSettings({ disabled: x })}
                    checked={settings.disabled}
                  />
                  <Label htmlFor='disable-sidebar'>Disable Sidebar</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hide sidebar</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <Separator />
      </div>
    </ContentLayout>
  );
}
