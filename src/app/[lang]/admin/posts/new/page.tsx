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
  // BreadcrumbTest
} from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function NewPostPage() {
  const pathname = usePathname();
  const routeArray = pathname.split('/');
  return (
    <ContentLayout title='New Post'>
      <Breadcrumb path='Home/Dashboard/Posts/New' />
      <PlaceholderContent />
    </ContentLayout>
  );
}
