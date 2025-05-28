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

export default function ClassSubjectsPage() {
  return (
    <ContentLayout title='Class-Subjects'>
      <Breadcrumb path='Home/Class-Subjects' />

      <PlaceholderContent />
    </ContentLayout>
  );
}
