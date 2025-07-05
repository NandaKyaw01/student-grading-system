import { getAllEnrollments } from '@/actions/enrollment';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { enrollmentSearchParamsCache } from '@/lib/search-params/enrollment';
import { Plus } from 'lucide-react';
import { SearchParams } from 'nuqs';
import { Suspense } from 'react';
import { EnrollmentDataTable } from './_components/enrollment-data-table';
import { EnrollmentModal } from './_components/enrollment-modal';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { getAcademicYears } from '@/actions/academic-year';
import { getSemesters } from '@/actions/semester';
import { getClasses } from '@/actions/class';

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

  const promises = Promise.all([
    getAllEnrollments(search, {
      includeDetails: true
    }),
    getAcademicYears(),
    getSemesters(undefined, {
      academicYearId: search.academicYearId
    }),
    getClasses(undefined, {
      semesterId: search.semesterId
    })
  ]);

  const suspenseKey = `results-${search.academicYearId || 'all'}-${search.semesterId || 'all'}`;

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
        <Suspense
          key={suspenseKey}
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <EnrollmentDataTable promises={promises} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
