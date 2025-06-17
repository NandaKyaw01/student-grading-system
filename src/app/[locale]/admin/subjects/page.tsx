import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Button } from '@/components/ui/button';
import { getSubjects } from '@/actions/subject';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { SubjectDialog } from './_components/subject-modal';
import SubjectsTable from './_components/subject-table';

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

export default function SubjectsPage() {
  const subjects = getSubjects();
  const t = useTranslations('AdminNavBarTitle');

  return (
    <ContentLayout
      title={t('subjects')}
      breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-3xl font-bold tracking-tight'>Subjects</h5>
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
        <Suspense fallback='loading...'>
          <SubjectsTable subjects={subjects} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
