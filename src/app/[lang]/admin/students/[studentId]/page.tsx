import { ContentLayout } from '@/components/admin-panel/content-layout';
// import FormCardSkeleton from '@/components/form-card-skeleton';
import { Suspense } from 'react';
import StudentViewPage from '../_components/student-view-page';

export const metadata = {
  title: 'Dashboard : Product View'
};

type PageProps = { params: Promise<{ studentId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;

  return (
    <ContentLayout title='Students'>
      <div className='flex-1 space-y-4'>
        <Suspense fallback='loading...'>
          <StudentViewPage studentId={params.studentId} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
