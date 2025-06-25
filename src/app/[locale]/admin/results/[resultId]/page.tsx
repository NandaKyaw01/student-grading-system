import { getResultById } from '@/actions/result';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import FormCardSkeleton from '@/components/form-card-skeleton';
import { Separator } from '@/components/ui/separator';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ResultForm from '../_components/result-form';

export const metadata = {
  title: 'Results : Result View'
};

type PageProps = { params: Promise<{ resultId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  let result = null;
  let pageTitle = 'Create New Result';

  if (params.resultId !== 'new') {
    result = await getResultById(params.resultId);
    if (!result) {
      notFound();
    }
    pageTitle = `Edit Result`;
  }

  return (
    <ContentLayout
      title='Results'
      breadcrumb={
        <ActiveBreadcrumb
          path={[
            {
              name: 'Home',
              link: '/'
            },
            {
              name: 'Results',
              link: '/admin/results'
            },
            {
              name: params.resultId !== 'new' ? params.resultId : 'new',
              link: ''
            }
          ]}
        />
      }
    >
      <div className='flex-1 space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-2xl font-bold tracking-tight'>
              {params.resultId !== 'new'
                ? `Edit Result ( ID - ${params.resultId} )`
                : 'Add New Result'}
            </h5>
            <p className='text-muted-foreground text-sm'>
              Manage student results (Server side table functionalities.)
            </p>
          </div>
        </div>
        <Separator />
        <Suspense fallback={<FormCardSkeleton />}>
          <ResultForm initialData={result} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
