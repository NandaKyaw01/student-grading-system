import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { useTranslations } from 'next-intl';
import XlsxImportForm from './_components/xlsx-import-form';

type BreadcrumbProps = {
  name: string;
  link: string;
};

export default function ImportResultPage() {
  const t = useTranslations('ImportResultsPage');
  const bredcrumb: BreadcrumbProps[] = [
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
      <XlsxImportForm />
    </ContentLayout>
  );
}
