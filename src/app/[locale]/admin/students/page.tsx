import Link from 'next/link';

import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  studentSearchParamsCache
  // studentSerialize
} from '@/lib/search-params/student';
import { cn } from '@/lib/utils';
import { getAllStudents } from '@/actions/student';
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
    name: 'Students',
    link: ''
  }
];
export default async function StudentsPage(props: pageProps) {
  const t = await getTranslations('AdminNavBarTitle');
  const searchParams = await props.searchParams;
  const search = studentSearchParamsCache.parse(searchParams);
  // const key = studentSerialize({ ...searchParams });

  const promises = getAllStudents({
    ...search
  });
  // console.log('search', search);
  // promises.then((value) => console.log('parimise: ', value));
  return (
    <ContentLayout
      title={t('students')}
      breadcrumb={<ActiveBreadcrumb path={bredcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-2xl font-bold tracking-tight'>Students</h5>
            <p className='text-muted-foreground text-sm'>
              Manage students (Server side table functionalities.)
            </p>
          </div>

          <StudentDialog mode='new'>
            <Button className='text-xs md:text-sm'>
              <Plus className='mr-2 h-4 w-4' /> Add New Student
            </Button>
          </StudentDialog>
        </div>
        <Separator />

        <Suspense
          // key={key}
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
