'use client';
import Link from 'next/link';

import PlaceholderContent from '@/components/demo/placeholder-content';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

export default function GradesPage() {
  return (
    <ContentLayout title='Grades'>
      <Breadcrumb path='Home/Grades' />
      <PlaceholderContent />
    </ContentLayout>
  );
}
