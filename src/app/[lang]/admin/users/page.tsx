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

export default function UsersPage() {
  return (
    <ContentLayout title='Users'>
      <Breadcrumb path='Home/Dashboard/Users' />

      <PlaceholderContent />
    </ContentLayout>
  );
}
