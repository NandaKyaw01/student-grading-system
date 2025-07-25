import { getAcademicYears } from '@/actions/academic-year';
import { getClasses } from '@/actions/class';
import { getSemesters } from '@/actions/semester';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { Separator } from '@/components/ui/separator';
import { classSubjectSearchParamsCache } from '@/lib/search-params/class-subject';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs';
import { Suspense } from 'react';
import ClassSubjectsTable from './_components/class-subject-table';

type pageProps = {
  searchParams: Promise<SearchParams>;
};
type BreadcrumbProps = {
  name: string;
  link: string;
};

export default async function ClassSubjectsPage(props: pageProps) {
  const t = await getTranslations('ClassSubjectPage');

  const searchParams = await props.searchParams;
  const search = classSubjectSearchParamsCache.parse(searchParams);

  const breadcrumb: BreadcrumbProps[] = [
    {
      name: t('home'),
      link: '/'
    },
    {
      name: t('title'),
      link: ''
    }
  ];

  const promises = Promise.all([
    getClasses<true>(search, { includeDetails: true }),
    getAcademicYears(),
    getSemesters(undefined, {
      academicYearId: search.academicYearId
    }),
    getClasses(undefined, { semesterId: search.semesterId })
  ]);

  const suspenseKey = `results-${search.academicYearId || 'all'}-${search.semesterId || 'all'}`;

  return (
    <ContentLayout
      title={t('title')}
      breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-2xl font-bold tracking-tight'>{t('title')}</h5>
            <p className='text-muted-foreground text-sm'>{t('subtitle')}</p>
          </div>
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
          key={suspenseKey}
        >
          <ClassSubjectsTable promises={promises} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
