import { getAcademicYears } from '@/actions/academic-year';
import { getSemesters } from '@/actions/semester';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Separator } from '@/components/ui/separator';
import { semesterSearchParamsCache } from '@/lib/search-params/semester';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs';
import { Suspense } from 'react';
import CreateSemesterButton from './_components/create-semester-button';
import SemestersTable from './_components/semester-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function SemestersPage(props: pageProps) {
  const searchParams = await props.searchParams;
  const search = semesterSearchParamsCache.parse(searchParams);
  const semesters = getSemesters(search, { includeDetails: true });
  const academicYears = getAcademicYears();
  const t = await getTranslations('SemestersPage');

  const breadcrumb = [
    {
      name: t('home'),
      link: '/'
    },
    {
      name: t('title'),
      link: ''
    }
  ];

  return (
    <ContentLayout
      title={t('title')}
      breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-2xl font-bold tracking-tight'>{t('title')}</h5>
            <p className='text-muted-foreground text-sm'>
              {t('subtitle')}
            </p>
          </div>
          <CreateSemesterButton academicYear={academicYears} />
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <SemestersTable semester={semesters} academicYear={academicYears} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
