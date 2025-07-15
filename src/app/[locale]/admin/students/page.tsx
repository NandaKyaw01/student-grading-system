import { getAllStudents } from '@/actions/student';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { studentSearchParamsCache } from '@/lib/search-params/student';
import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { StudentDataTable } from './_components/student-data-table';
import { StudentDialog } from './_components/student-modal';

export const metadata = {
  title: 'Admin: Students'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function StudentsPage(props: pageProps) {
  const t = await getTranslations('StudentsPage');
  const searchParams = await props.searchParams;
  const search = studentSearchParamsCache.parse(searchParams);

  const promises = getAllStudents(search);

  const bredcrumb = [
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
      breadcrumb={<ActiveBreadcrumb path={bredcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-2xl font-bold tracking-tight'>{t('title')}</h5>
            <p className='text-muted-foreground text-sm'>{t('subtitle')}</p>
          </div>

          <StudentDialog mode='new'>
            <Button className='text-xs md:text-sm'>
              <Plus className='mr-2 h-4 w-4' /> {t('add_student')}
            </Button>
          </StudentDialog>
        </div>
        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <StudentDataTable promises={promises} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
