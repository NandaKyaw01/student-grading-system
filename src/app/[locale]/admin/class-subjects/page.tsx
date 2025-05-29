import Link from 'next/link';

import PlaceholderContent from '@/components/demo/placeholder-content';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';

export default function ClassSubjectsPage() {
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
      name: 'Class Subjects',
      link: ''
    }
  ];
  return (
    <ContentLayout title='Class-Subjects'>
      <ActiveBreadcrumb path={bredcrumb} />

      <PlaceholderContent />
    </ContentLayout>
  );
}
