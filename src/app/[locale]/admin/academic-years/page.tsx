import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Button } from '@/components/ui/button';
import { getAcademicYears } from '@/actions/academic-year';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { AcademicYearDialog } from './_components/academic-year-modal';
import AcademicYearsDataTable from './_components/academic-year-data-table';
import { SearchParams } from 'nuqs';
import { GetClassSchema } from '@/lib/search-params/academic-year';
import { classSearchParamsCache } from '@/lib/search-params/academic-year';

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
    name: 'Academic Years',
    link: ''
  }
];

export default async function AcademicYearsPage(props: pageProps) {
  const searchParams = await props.searchParams;
  const search = classSearchParamsCache.parse(searchParams);
  const academicYears = getAcademicYears({ ...search });
  const t = await getTranslations('AdminNavBarTitle');
  return (
    <ContentLayout
      title={t('academic_year')}
      breadcrumb={<ActiveBreadcrumb path={bredcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-3xl font-bold tracking-tight'>
              Academic Years
            </h5>
            <p className='text-muted-foreground text-sm'>
              Manage years (Server side table functionalities.)
            </p>
          </div>
          <AcademicYearDialog>
            <Button className='text-xs md:text-sm'>
              <Plus className='mr-2 h-4 w-4' /> Add New
            </Button>
          </AcademicYearDialog>
        </div>
        <Separator />
        <Suspense fallback='loading...'>
          <AcademicYearsDataTable academicYears={academicYears} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
