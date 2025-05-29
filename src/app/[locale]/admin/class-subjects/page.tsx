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
    name: 'Class Subjects',
    link: ''
  }
];
export default function ClassSubjectsPage() {
  return (
    <ContentLayout title='Class-Subjects'>
      <ActiveBreadcrumb path={bredcrumb} />

      <PlaceholderContent />
    </ContentLayout>
  );
}
