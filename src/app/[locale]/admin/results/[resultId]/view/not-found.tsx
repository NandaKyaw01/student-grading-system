import React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';

export default function NotFound() {
  const t = useTranslations('NotFound.result');

  const checkList = [
    t('check_list.id_correct'),
    t('check_list.result_published'),
    t('check_list.result_published')
  ];

  return (
    <ContentLayout
      title={t('results')}
      breadcrumb={
        <ActiveBreadcrumb
          path={[
            {
              name: t('home'),
              link: '/'
            },
            {
              name: t('results'),
              link: '/admin/results'
            },
            {
              name: t('not_found'),
              link: ''
            }
          ]}
        />
      }
    >
      <div className='min-h-[calc(100vh-110px)] flex items-center justify-center p-4'>
        <Card className='max-w-md w-full shadow-lg border-0 bg-white/80 backdrop-blur'>
          <CardHeader className='text-center'>
            <div className='mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4'>
              <AlertCircle className='h-8 w-8 text-red-600' />
            </div>
            <CardTitle className='text-2xl text-gray-900'>
              {t('title')}
            </CardTitle>
          </CardHeader>
          <CardContent className='text-center space-y-4'>
            <p className='text-gray-600'>{t('description')}</p>
            <div className='space-y-2'>
              <p className='text-sm text-gray-500'>{t('check')}</p>
              <ul className='text-sm text-gray-500 space-y-1'>
                {checkList.map((item: string, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className='pt-4'>
              <Link href='/admin/results'>
                <Button className='w-full'>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  {t('back_to_results')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
