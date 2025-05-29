import Link from 'next/link';

import PlaceholderContent from '@/components/demo/placeholder-content';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';

export default function ClassesPage() {
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
      name: 'Classes',
      link: ''
    }
  ];
  return (
    <ContentLayout title='Classes'>
      <ActiveBreadcrumb path={bredcrumb} />

      <PlaceholderContent />
    </ContentLayout>
  );
}
