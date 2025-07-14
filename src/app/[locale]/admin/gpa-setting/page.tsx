import { getGradeScales } from '@/actions/grade-scale';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';
import { GradeScaleDataTable } from './_components/grade-scale-data-table';
import { GradeScaleModal } from './_components/grade-scale-modal';
import { gradeScaleSearchParamsCache } from '@/lib/search-params/grade-scale';
import { SearchParams } from 'nuqs';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  title: 'Grade Scales : Grading System'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

type BreadcrumbProps = {
  name: string;
  link: string;
};

export default async function GPASettingPage(props: pageProps) {
  const searchParams = await props.searchParams;
  const search = gradeScaleSearchParamsCache.parse(searchParams);
  const gradeScalesPromise = getGradeScales(search);
  const t = await getTranslations('GpaSettingPage');

  const bredcrumb: BreadcrumbProps[] = [
    {
      name: t('breadcrumb_home'),
      link: '/'
    },
    {
      name: t('breadcrumb_gpa_setting'),
      link: ''
    }
  ];

  return (
    <ContentLayout
      title={t('title')}
      breadcrumb={<ActiveBreadcrumb path={bredcrumb} />}
    >
      <div className='flex-1 space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-2xl font-bold tracking-tight'>{t('title')}</h5>
            <p className='text-muted-foreground text-sm'>{t('description')}</p>
          </div>
          <GradeScaleModal>
            <Button className='text-xs md:text-sm'>
              <Plus className='mr-2 h-4 w-4' /> {t('new_grade_scale')}
            </Button>
          </GradeScaleModal>
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <GradeScaleDataTable promises={gradeScalesPromise} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
