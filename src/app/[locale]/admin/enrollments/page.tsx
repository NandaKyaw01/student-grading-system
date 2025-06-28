import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Suspense } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { getAllEnrollments } from '@/actions/enrollment';
import { EnrollmentDataTable } from './_components/enrollment-data-table';
import { SearchParams } from 'nuqs';
import { enrollmentSearchParamsCache } from '@/lib/search-params/enrollment';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { EnrollmentModal } from './_components/enrollment-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Enrollments : Enrollment Management'
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
    name: 'Enrollments',
    link: ''
  }
];

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  const search = enrollmentSearchParamsCache.parse(searchParams);
  // const key = studentSerialize({ ...searchParams });

  const enrollmentsPromise = getAllEnrollments(search, {
    includeDetails: true
  });

  return (
    <ContentLayout
      title='Enrollments'
      breadcrumb={<ActiveBreadcrumb path={bredcrumb} />}
    >
      <div className='flex-1 space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-2xl font-bold tracking-tight'>Enrollments</h5>
            <p className='text-muted-foreground text-sm'>
              Manage Enrollments (Server side table functionalities.)
            </p>
          </div>
          <EnrollmentModal>
            <Button className='text-xs md:text-sm'>
              <Plus className='mr-2 h-4 w-4' /> Add New Enrollment
            </Button>
          </EnrollmentModal>
        </div>
        <Separator />
        <Suspense fallback={<div>Loading enrollments...</div>}>
          <EnrollmentDataTable promises={enrollmentsPromise} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
