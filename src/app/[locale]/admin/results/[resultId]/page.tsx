import { getResultById } from '@/actions/result';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import FormCardSkeleton from '@/components/form-card-skeleton';
import { Separator } from '@/components/ui/separator';
import { notFound } from 'next/navigation';
import { Suspense, use } from 'react';
import ResultForm from '../_components/result-form';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  title: 'Results : Result View'
};

type PageProps = {
  params: Promise<{ resultId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const t = await getTranslations('ResultsBySemester.ResultPage');

  let result = null;
  let pageTitle = t('create_title');
  let initialFormData = null;

  if (params.resultId !== 'new') {
    // This is edit mode - fetch existing result
    result = await getResultById(params.resultId);
    if (!result) {
      notFound();
    }
    pageTitle = t('edit_title');
  } else {
    // This is create mode - check for query parameters
    const { semesterId, studentId, academicYearId } = searchParams;

    if (semesterId || studentId || academicYearId) {
      initialFormData = {
        studentId: studentId ? parseInt(studentId as string) || 0 : 0,
        academicYearId: academicYearId
          ? parseInt(academicYearId as string) || 0
          : 0,
        semesterId: semesterId ? parseInt(semesterId as string) || 0 : 0,
        enrollmentId: 0,
        grades: []
      };
    }
  }

  return (
    <ContentLayout
      title='Results'
      breadcrumb={
        <ActiveBreadcrumb
          path={[
            {
              name: t('breadcrumbs.home'),
              link: '/'
            },
            {
              name: t('breadcrumbs.results'),
              link: '/admin/results'
            },
            {
              name:
                params.resultId !== 'new'
                  ? params.resultId
                  : t('breadcrumbs.new'),
              link: ''
            }
          ]}
        />
      }
    >
      <div className='flex-1 space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-2xl font-bold tracking-tight'>{pageTitle}</h5>
          </div>
        </div>
        <Separator />
        <Suspense fallback={<FormCardSkeleton />}>
          <ResultForm initialData={result || initialFormData} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
