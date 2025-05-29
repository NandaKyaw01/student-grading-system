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
    name: 'Subjects',
    link: ''
  }
];
export default function SubjectsPage() {
  return (
    <ContentLayout title='Subjects'>
      <ActiveBreadcrumb path={bredcrumb} />

      <PlaceholderContent />
    </ContentLayout>
  );
}
