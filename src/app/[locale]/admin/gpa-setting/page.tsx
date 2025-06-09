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
import { GradeScaleDataTable } from './_components/grade-scale-data-table';
import { getAllGradeScales } from '@/actions/grade-scale';

export const metadata = {
  title: 'Grade Scales : Grading System'
};

export default async function GPASettingPage() {
  const gradeScalesPromise = getAllGradeScales();

  return (
    <ContentLayout title='Grade Scales'>
      <div className='flex-1 space-y-4'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href='/'>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Grade Scales</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Suspense fallback={<div>Loading grade scales...</div>}>
          <GradeScaleDataTable promises={gradeScalesPromise} />
        </Suspense>
      </div>
    </ContentLayout>
  );
}
