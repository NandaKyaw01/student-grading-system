import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AcademicYearResultView from './_components/academic-year-result-view';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getAcademicYearResult } from '@/actions/academic-result';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{
    academicResultId: string;
    locale: string;
  }>;
}

function AcademicYearResultSkeleton() {
  return (
    <div className='container mx-auto p-4 space-y-6'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-96' />
      </div>

      <Card>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-6 w-16' />
              </div>
            ))}
          </div>

          <div className='space-y-4'>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className='space-y-3'>
                <Skeleton className='h-6 w-32' />
                <div className='border rounded-lg p-4 space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function AcademicYearResultPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = Number.parseInt(resolvedParams.academicResultId);
  const t = await getTranslations('AcademicYearResultsPage');

  if (isNaN(id)) {
    notFound();
  }

  return (
    <ContentLayout
      title={t('ResultView.title')}
      breadcrumb={
        <ActiveBreadcrumb
          path={[
            {
              name: t('home'),
              link: '/'
            },
            {
              name: t('ResultView.title'),
              link: '/admin/academic-year-results'
            },
            {
              name: `${id}`,
              link: ''
            }
          ]}
        />
      }
    >
      <Suspense fallback={<AcademicYearResultSkeleton />}>
        <AcademicYearResultContent id={id} />
      </Suspense>
    </ContentLayout>
  );
}

async function AcademicYearResultContent({ id }: { id: number }) {
  const { result } = await getAcademicYearResult(id);

  if (!result) {
    notFound();
  }

  return <AcademicYearResultView data={result} />;
}
