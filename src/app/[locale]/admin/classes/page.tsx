import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Button } from '@/components/ui/button';
import { getClasses } from '@/actions/class';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { ClassDialog } from './_components/class-modal';
import ClassesTable from './_components/class-table';
import { getSemesters } from '@/actions/semester';
import { classSearchParamsCache } from '@/lib/search-params/class';
import { SearchParams } from 'nuqs';

type pageProps = {
  searchParams: Promise<SearchParams>;
};
type BreadcrumbProps = {
  name: string;
  link: string;
};
const breadcrumb: BreadcrumbProps[] = [
  {
    name: 'Home',
    link: '/'
  },
  {
    name: 'Classes',
    link: ''
  }
];

export default async function ClassesPage(props: pageProps) {
  const searchParams = await props.searchParams;
  const search = classSearchParamsCache.parse(searchParams);

  const classes = getClasses<true>(undefined, { includeDetails: true });
  const t = await getTranslations('AdminNavBarTitle');

  return (
    <ContentLayout
      title={t('classes')}
      breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-3xl font-bold tracking-tight'>Classes</h5>
            <p className='text-muted-foreground text-sm'>
              Manage classes (Server side table functionalities.)
            </p>
          </div>
          <ClassDialog mode='new'>
            <Button className='text-xs md:text-sm'>
              <Plus className='mr-2 h-4 w-4' /> Add New Class
            </Button>
          </ClassDialog>
        </div>
        <Separator />
        <Suspense fallback='loading...'>
          <ClassesTable classProp={classes} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
