import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Button } from '@/components/ui/button';
import { getSemesters } from '@/actions/semester';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Suspense, use } from 'react';
import { SemesterDialog } from './_components/semester-modal';
import SemestersTable from './_components/semester-table';
import { getAcademicYears } from '@/actions/academic-year';
import { SearchParams } from 'nuqs';
import { semesterSearchParamsCache } from '@/lib/search-params/semester';

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
    name: 'Semesters',
    link: ''
  }
];

export default async function SemestersPage(props: pageProps) {
  const searchParams = await props.searchParams;
  const search = semesterSearchParamsCache.parse(searchParams);
  const semesters = getSemesters({ ...search }, { includeDetails: true });
  const academicYears = getAcademicYears();
  const t = await getTranslations('AdminNavBarTitle');

  return (
    <ContentLayout
      title={'semesters'}
      breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-3xl font-bold tracking-tight'>Semesters</h5>
            <p className='text-muted-foreground text-sm'>
              Manage semesters (Server side table functionalities.)
            </p>
          </div>
          {/* <SemesterDialog semester={semester}>
            <Button className='text-xs md:text-sm'>
              <Plus className='mr-2 h-4 w-4' /> Add New Semester
            </Button>
          </SemesterDialog> */}
        </div>
        <Separator />
        <Suspense fallback='loading...'>
          <SemestersTable semesters={semesters} academicYear={academicYears} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
