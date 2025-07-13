import Link from 'next/link';

import { getAcademicYears } from '@/actions/academic-year';
import { getClasses } from '@/actions/class';
import { getAllResults } from '@/actions/result';
import { getSemesters } from '@/actions/semester';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { resultSearchParamsCache } from '@/lib/search-params/result';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { ResultDataTable } from './_components/result-data-table';

export const metadata = {
  title: 'Admin: Results'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ResultsPage(props: pageProps) {
  const t = await getTranslations('ResultsBySemester');
  const searchParams = await props.searchParams;
  const search = resultSearchParamsCache.parse(searchParams);

  const promises = Promise.all([
    getAllResults(search, {
      includeDetails: true
    }),
    getAcademicYears(),
    getSemesters(undefined, {
      academicYearId: search.academicYearId
    }),
    getClasses(undefined, {
      semesterId: search.semesterId
    })
  ]);

  const suspenseKey = `results-${search.academicYearId || 'all'}-${search.semesterId || 'all'}`;

  return (
    <ContentLayout
      title={t('title')}
      breadcrumb={
        <ActiveBreadcrumb
          path={[
            {
              name: t('home'),
              link: '/'
            },
            {
              name: t('title'),
              link: ''
            }
          ]}
        />
      }
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-2xl font-bold tracking-tight'>{t('title')}</h5>
            <p className='text-muted-foreground text-sm'>{t('subtitle')}</p>
          </div>
          <Link
            href='/admin/results/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='h-4 w-4' />
            {t('add_result')}
          </Link>
        </div>
        <Separator />

        <Suspense
          key={suspenseKey}
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
