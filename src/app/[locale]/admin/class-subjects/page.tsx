import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Button } from '@/components/ui/button';
import { getClasses } from '@/services/class';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import ClassSubjectsTable from './_components/class-subject-table';
import { revalidateTag } from 'next/cache';
import { revalidateClassSubjects } from '@/actions/class-subject';

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
    name: 'Class-Subjects',
    link: ''
  }
];

export default function ClassSubjectsPage() {
  const classes = getClasses({ includeDetails: true });

  const t = useTranslations('AdminNavBarTitle');

  return (
    <ContentLayout
      title={t('class_subjects')}
      breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
    >
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-3xl font-bold tracking-tight'>
              Class-Subject Assignments
            </h5>
            <p className='text-muted-foreground text-sm'>
              Manage relationships between classes and subjects
            </p>
          </div>
        </div>
        <Separator />
        <Suspense fallback='loading...'>
          <ClassSubjectsTable classes={classes} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
