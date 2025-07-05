import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

import LanguageToggle from '@/components/language-toggle';
import { cn } from '@/lib/utils';
import { Locale, useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default function HomePage({ params }: Props) {
  const { locale } = use(params);

  // Enable static rendering
  setRequestLocale(locale);

  // Once the request locale is set, you
  // can call hooks from `next-intl`
  const t = useTranslations('HomePage');

  return (
    <div className='flex flex-col min-h-screen'>
      <header
        className='z-[50] sticky top-0 w-full bg-background/95 border-b backdrop-blur-sm
          dark:bg-black/[0.6] border-border/40'
      >
        <div className='container h-14 flex items-center'>
          <Link
            href='/'
            className='flex justify-start items-center hover:opacity-85 transition-opacity duration-300'
          >
            {/* <PanelsTopLeft className='w-6 h-6 mr-3' /> */}
            <Image
              src='/assets/image/logo.png'
              width={50}
              height={50}
              alt='logo'
              className='w-6 h-6 mr-3'
            />
            <span className='font-bold'>SmartGrade UCSH</span>
            <span className='sr-only'>SmartGrade UCSH</span>
          </Link>
          <nav className='ml-auto flex items-center gap-2'>
            <LanguageToggle />
            <ModeToggle />
          </nav>
        </div>
      </header>
      <main className='min-h-[calc(100vh-57px-97px)] flex-1'>
        <div className='container relative pb-10'>
          <section
            className='mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8
              lg:py-24 lg:pb-6'
          >
            <h1
              className={cn(
                'text-center text-3xl font-bold tracking-tighter md:text-5xl ',
                locale == 'mm'
                  ? 'leading-normal lg:leading-normal'
                  : 'leading-tight lg:leading-[1.1]'
              )}
            >
              {t('title')}
            </h1>
            <span className='max-w-[750px] text-center text-lg font-light text-foreground'>
              {t('subtitle')}
            </span>
            <div className='flex w-full items-center justify-center space-x-4 py-4 md:pb-6'>
              <Button variant='default' asChild>
                <Link href='/admin/academic-year-results'>
                  {t('search')}
                  <ArrowRightIcon className='ml-2' />
                </Link>
              </Button>
              <Button variant='outline' asChild>
                <Link href='/admin/dashboard'>{t('dashboard')}</Link>
              </Button>
            </div>
          </section>
          <div className='w-full flex justify-center relative'>
            <Image
              src='/assets/image/ucsh1.jpg'
              width={1080}
              height={600}
              alt='home-image'
              priority
              className='border rounded-xl shadow-sm'
            />
          </div>
        </div>
      </main>
      <footer className='py-6 md:py-0 border-t border-border/40'>
        <div className='container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row'>
          <p className='text-balance text-center text-sm leading-loose text-muted-foreground'>
            © 2025 UCSH. All rights reserved. The source code is available on{' '}
            <Link
              href='https://github.com/NandaKyaw01/student-grading-system'
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium underline underline-offset-4'
            >
              GitHub
            </Link>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
