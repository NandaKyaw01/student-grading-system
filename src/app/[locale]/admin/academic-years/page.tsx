import { getAcademicYears } from '@/actions/academic-year';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { classSearchParamsCache } from '@/lib/search-params/academic-year';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs';
import { Suspense } from 'react';
import { AcademicYearCreateButton } from './_components/academic-year-create-button';
import AcademicYearsDataTable from './_components/academic-year-data-table';
import { Separator } from '@/components/ui/separator';

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
  const search = classSearchParamsCache.parse(searchParams);
  const academicYears = getAcademicYears({ ...search });
  const t = await getTranslations('AdminNavBarTitle');
  return (
    <ContentLayout
      title={t('academic_year')}
      breadcrumb={<ActiveBreadcrumb path={bredcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-3xl font-bold tracking-tight'>
              Academic Years
            </h5>
            <p className='text-muted-foreground text-sm'>
              Manage years (Server side table functionalities.)
            </p>
          </div>
          <AcademicYearCreateButton />
        </div>
        <Separator />
        <Suspense fallback='loading...'>
          <AcademicYearsDataTable academicYears={academicYears} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
