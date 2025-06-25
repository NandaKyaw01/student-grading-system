import Link from 'next/link';

import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { resultSearchParamsCache } from '@/lib/search-params/result';
import { cn } from '@/lib/utils';
import { getAllResults } from '@/actions/result';
import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { ResultDataTable } from './_components/result-data-table';
import { getAcademicYears } from '@/actions/academic-year';
import { getSemesters } from '@/actions/semester';
import { getClasses } from '@/actions/class';

export const metadata = {
  title: 'Admin: Results'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

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
    name: 'Results',
    link: ''
  }
];
export default async function ResultsPage(props: pageProps) {
  const t = await getTranslations('AdminNavBarTitle');
  const searchParams = await props.searchParams;
  const search = resultSearchParamsCache.parse(searchParams);

  const promises = Promise.all([
    getAllResults(search, {
      includeDetails: true
    }),
    getAcademicYears(),
    getSemesters(),
    getClasses()
  ]);

  return (
    <ContentLayout
      title={'Results'}
      breadcrumb={<ActiveBreadcrumb path={bredcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-3xl font-bold tracking-tight'>Results</h5>
            <p className='text-muted-foreground text-sm'>
              Manage student results (Server side table functionalities.)
            </p>
          </div>
          <Link
            href='/admin/results/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-2 h-4 w-4' /> Add New
          </Link>
        </div>
        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <ResultDataTable promises={promises} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
