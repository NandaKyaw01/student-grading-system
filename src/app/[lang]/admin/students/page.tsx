import Link from 'next/link';

import { ContentLayout } from '@/components/admin-panel/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { SearchParams } from 'nuqs/server';
import {
  studentSearchParamsCache,
  studentSerialize
} from '@/lib/search-params/student';
import { getAllStudents } from '@/services/student';
import { getAllClasses } from '@/services/class';
import { getAllAcademicYears } from '@/services/academic-year';
import { StudentDataTable } from './_components/student-data-table';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Admin: Students'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function StudentsPage(props: pageProps) {
  const searchParams = await props.searchParams;
  const search = studentSearchParamsCache.parse(searchParams);
  // const key = studentSerialize({ ...searchParams });

  const promises = Promise.all([
    getAllStudents({
      ...search
    }),
    getAllClasses(),
    getAllAcademicYears()
  ]);

  return (
    <ContentLayout
      title='Students'
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href='/'>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Students</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-3xl font-bold tracking-tight'>Students</h5>
            <p className='text-muted-foreground text-sm'>
              Manage students (Server side table functionalities.)
            </p>
          </div>
          <Link
            href='/admin/students/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-2 h-4 w-4' /> Add New
          </Link>
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
