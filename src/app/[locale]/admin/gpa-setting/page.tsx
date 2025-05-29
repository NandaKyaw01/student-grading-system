import Link from 'next/link';

import PlaceholderContent from '@/components/demo/placeholder-content';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';

type BreadcrumbProps = {
  name: string;
  link: string;
};
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
export default function GPASettingPage() {
  return (
    <ContentLayout title='GPA Setting'>
      <ActiveBreadcrumb path={bredcrumb} />

      <PlaceholderContent />
    </ContentLayout>
  );
}
