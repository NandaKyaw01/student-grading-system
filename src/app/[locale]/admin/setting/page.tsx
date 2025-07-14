'use client';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { ThemeSelector } from '@/components/theme-selector';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useSidebar } from '@/hooks/use-sidebar';
import { useStore } from '@/hooks/use-store';
import { useTranslations } from 'next-intl';

type BreadcrumbProps = {
  name: string;
  link: string;
};

export default function SettingPage() {
  const t = useTranslations('SettingPage');
  const sidebar = useStore(useSidebar, (x) => x);

  const bredcrumb: BreadcrumbProps[] = [
    {
      name: t('breadcrumb_home'),
      link: '/'
    },
    {
      name: t('breadcrumb_setting'),
      link: ''
    }
  ];

  if (!sidebar) return null;
  const { settings, setSettings } = sidebar;
  return (
    <ContentLayout
      title={t('breadcrumb_setting')}
      breadcrumb={<ActiveBreadcrumb path={bredcrumb} />}
    >
      <div className='space-y-6'>
        <div>
          <h5 className='text-md font-medium'>{t('theme_title')}</h5>
          <p className='text-sm text-muted-foreground'>
            {t('theme_description')}
          </p>
        </div>
        <ThemeSelector />

        <Separator />
        <div>
          <h5 className='text-md font-medium'>{t('sidebar_title')}</h5>
          <p className='text-sm text-muted-foreground'>
            {t('sidebar_description')}
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
                  <Label htmlFor='is-hover-open'>{t('hover_open_label')}</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('hover_open_tooltip')}</p>
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
                  <Label htmlFor='disable-sidebar'>
                    {t('disable_sidebar_label')}
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('disable_sidebar_tooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <Separator />
      </div>
    </ContentLayout>
  );
}
