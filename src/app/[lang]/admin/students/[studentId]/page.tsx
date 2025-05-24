import { ContentLayout } from '@/components/admin-panel/content-layout';
// import FormCardSkeleton from '@/components/form-card-skeleton';
import { Suspense } from 'react';
import StudentViewPage from '../_components/student-view-page';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import FormCardSkeleton from '@/components/form-card-skeleton';

export const metadata = {
  title: 'Students : Student View'
};

type PageProps = { params: Promise<{ studentId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;

  return (
    <ContentLayout
      title='Students'
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href='/'>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href='/admin/students'>Students</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{params.studentId ?? 'new'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
    >
      <div className='flex-1 space-y-4 max-w-lg'>
        <Suspense fallback={<FormCardSkeleton />}>
          <StudentViewPage studentId={params.studentId} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
