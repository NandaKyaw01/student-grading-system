import { getSubjects } from '@/actions/subject';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs';
import { Suspense } from 'react';
import { SubjectDialog } from './_components/subject-modal';
import SubjectsTable from './_components/subject-table';
import { subjectSearchParamsCache } from '@/lib/search-params/subject';
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
    name: 'Subjects',
    link: ''
  }
];

export default async function SubjectsPage(props: pageProps) {
  const searchParams = await props.searchParams;
  const t = await getTranslations('AdminNavBarTitle');

  const search = subjectSearchParamsCache.parse(searchParams);
  const subjects = getSubjects(search);

  return (
    <ContentLayout
      title={t('subjects')}
      breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-2xl font-bold tracking-tight'>Subjects</h5>
            <p className='text-muted-foreground text-sm'>
              Manage subjects (Server side table functionalities.)
            </p>
          </div>
          <SubjectDialog>
            <Button className='text-xs md:text-sm'>
              <Plus className='mr-2 h-4 w-4' /> Add New Subject
            </Button>
          </SubjectDialog>
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <SubjectsTable subjectProp={subjects} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
