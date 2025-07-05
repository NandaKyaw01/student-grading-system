import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Button } from '@/components/ui/button';
import { getClasses } from '@/actions/class';
import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { ClassDialog } from './_components/class-modal';
import ClassesTable from './_components/class-table';
import { getSemesters } from '@/actions/semester';
import { classSearchParamsCache } from '@/lib/search-params/class';
import { SearchParams } from 'nuqs';
import { Separator } from '@/components/ui/separator';
import { getAcademicYears } from '@/actions/academic-year';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';

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
  const t = await getTranslations('AdminNavBarTitle');
  const searchParams = await props.searchParams;
  const search = classSearchParamsCache.parse(searchParams);

  const promises = Promise.all([
    getClasses<true>(search, { includeDetails: true }),
    getAcademicYears(),
    getSemesters(undefined, {
      academicYearId: search.academicYearId
    })
  ]);

  const suspenseKey = `results-${search.academicYearId || 'all'}`;

  return (
    <ContentLayout
      title={t('classes')}
      breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-2xl font-bold tracking-tight'>Classes</h5>
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
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
          key={suspenseKey}
        >
          <ClassesTable promises={promises} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
