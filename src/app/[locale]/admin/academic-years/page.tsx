import Link from 'next/link';

import PlaceholderContent from '@/components/demo/placeholder-content';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';

export default function AcademicYearsPage() {
  interface BreadcrumbProps {
    name: string;
    link: string;
  }
  const bredcrumb: BreadcrumbProps[] = [
    {
      name: 'Home',
      link: '/'
    },
    {
      name: 'Academic Years',
      link: ''
    }
  ];

  return (
    <ContentLayout title='Academic Years'>
      <ActiveBreadcrumb path={bredcrumb} />

      <PlaceholderContent />
    </ContentLayout>
  );
}
