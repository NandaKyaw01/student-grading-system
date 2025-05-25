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

export default function AccountPage() {
  return (
    <ContentLayout title='Account'>
      <Breadcrumb path='Home/Dashboard/Account' />

      <PlaceholderContent />
    </ContentLayout>
  );
}
