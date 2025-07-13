import { getAcademicYears } from '@/actions/academic-year';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Separator } from '@/components/ui/separator';
import { academicYearSearchParamsCache } from '@/lib/search-params/academic-year';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs';
import { Suspense } from 'react';
import AcademicYearsDataTable from './_components/academic-year-data-table';
import CreateAcademicYearButton from './_components/create-academic-year-button';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';

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
    name: 'Academic Years',
    link: ''
  }
];

export default async function AcademicYearsPage(props: pageProps) {
  const searchParams = await props.searchParams;
  const search = academicYearSearchParamsCache.parse(searchParams);
  const academicYears = getAcademicYears(search, {
    includeDetails: true
  });
  // const t = await getTranslations('');

  return (
    <ContentLayout
      title={'academic_year'}
      breadcrumb={<ActiveBreadcrumb path={bredcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-2xl font-bold tracking-tight'>
              Academic Years
            </h5>
            <p className='text-muted-foreground text-sm'>
              Manage years (Server side table functionalities.)
            </p>
          </div>
          <CreateAcademicYearButton />
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <AcademicYearsDataTable academicYears={academicYears} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
