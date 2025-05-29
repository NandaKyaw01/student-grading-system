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
    name: 'Account',
    link: ''
  }
];
export default function AccountPage() {
  return (
    <ContentLayout title='Account'>
      <ActiveBreadcrumb path={bredcrumb} />
      <PlaceholderContent />
    </ContentLayout>
  );
}
