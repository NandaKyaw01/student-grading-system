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

export default function TagsPage() {
  return (
    <ContentLayout title='Tags'>
      <Breadcrumb path='Home/Dashboard/Tags' />

      <PlaceholderContent />
    </ContentLayout>
  );
}
