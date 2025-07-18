import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { useTranslations } from 'next-intl';
import CreateEnrollmentForm from './_components/enrollment-create-form-with-id';

export const metadata = {
  title: 'Enrollments : Enrollment Management'
};

export default function Page() {
  const t = useTranslations('EnrollmentsPage');
  const bredcrumb = [
    {
      name: t('home'),
      link: '/'
    },
    {
      name: t('title'),
      link: ''
    }
  ];

  return (
    <ContentLayout
      title={t('title')}
      breadcrumb={<ActiveBreadcrumb path={bredcrumb} />}
    >
      <CreateEnrollmentForm />
    </ContentLayout>
  );
}
