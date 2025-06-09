import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Suspense } from 'react';
import { SearchParams } from 'nuqs';
import { resultSearchParamsCache } from '@/lib/search-params/result';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Results : Result Management'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

const breadcrumb = [
  { name: 'Home', link: '/' },
  { name: 'Results', link: '' }
];

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  const search = resultSearchParamsCache.parse(searchParams);

  return (
    <ContentLayout
      title='Results'
      breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
    >
      <div className='flex-1 space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h5 className='text-3xl font-bold tracking-tight'>Results</h5>
            <p className='text-muted-foreground text-sm'>
              Manage Student Results and GPA Calculations
            </p>
          </div>
        </div>
        <Separator />
      </div>
    </ContentLayout>
  );
}
