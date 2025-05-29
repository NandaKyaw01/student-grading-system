import Link from 'next/link';

import PlaceholderContent from '@/components/demo/placeholder-content';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';

export default function GPASettingPage() {
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
      name: 'GPA Setting',
      link: ''
    }
  ];
  return (
    <ContentLayout title='GPA Setting'>
      <ActiveBreadcrumb path={bredcrumb} />

      <PlaceholderContent />
    </ContentLayout>
  );
}
