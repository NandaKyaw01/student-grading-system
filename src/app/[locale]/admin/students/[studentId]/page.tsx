import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Suspense } from 'react';
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
import { getStudentById } from '@/actions/student';
import { notFound } from 'next/navigation';
import StudentForm from '../_components/student-form';

export const metadata = {
  title: 'Students : Student View'
};

type PageProps = { params: Promise<{ studentId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  let student = null;
  let pageTitle = 'Create New Student';

  if (params.studentId !== 'new') {
    student = await getStudentById(params.studentId);
    if (!student) {
      notFound();
    }
    pageTitle = `Edit Student`;
  }

  return (
    <ContentLayout title='Students'>
      <div className='flex-1 space-y-4 max-w-lg'>
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
              <BreadcrumbPage>
                {params.studentId !== 'new' ? params.studentId : 'new'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Suspense fallback={<FormCardSkeleton />}>
          <StudentForm initialData={student} pageTitle={pageTitle} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
