import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from 'nuqs';
import XlsxImportForm from './_components/xlsx-import-form';

type pageProps = {
  searchParams: Promise<SearchParams>;
};

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
    name: 'Import Results',
    link: ''
  }
];

export default async function ImportResultPage(props: pageProps) {
  const searchParams = await props.searchParams;
  const t = await getTranslations('AdminNavBarTitle');

  return (
    <ContentLayout
      title={t('academic_year')}
      breadcrumb={<ActiveBreadcrumb path={bredcrumb} />}
    >
      <XlsxImportForm />
    </ContentLayout>
  );
}
