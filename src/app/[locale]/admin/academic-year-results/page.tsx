import { getAllAcademicYearResults } from '@/actions/academic-result';
import { getAcademicYears } from '@/actions/academic-year';
import { getClasses } from '@/actions/class';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { Separator } from '@/components/ui/separator';
import { academicResultSearchParamsCache } from '@/lib/search-params/academic-result';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { AcademicResultDataTable } from './_components/academic-result-data-table';

export const metadata = {
  title: 'Admin: Academic Year Results'
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
    name: 'Academic Results',
    link: ''
  }
];
export default async function AcademicYearResultsPage(props: pageProps) {
  const t = await getTranslations('AdminNavBarTitle');
  const searchParams = await props.searchParams;
  const search = academicResultSearchParamsCache.parse(searchParams);

  const promises = Promise.all([
    getAllAcademicYearResults(search, {
      includeDetails: true
    }),
    getAcademicYears(undefined, {
      includeDetails: true
    }),
    getClasses(undefined, {
      academicYearId: search.academicYearId
    })
  ]);

  const suspenseKey = `results-${search.academicYearId || 'all'}`;

  return (
    <ContentLayout
      title={'Results'}
      breadcrumb={<ActiveBreadcrumb path={bredcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-2xl font-bold tracking-tight'>
              Acadeimc Year Results
            </h5>
            <p className='text-muted-foreground text-sm'>
              Manage student results (Server side table functionalities.)
            </p>
          </div>
        </div>
        <Separator />

        <Suspense
          key={suspenseKey}
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <AcademicResultDataTable promises={promises} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
