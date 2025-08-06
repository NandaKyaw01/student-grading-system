'use client';

import { useRef } from 'react';
import { DashboardPDFDownload } from './pdf-download-button';
import DashboardFilter from './dashboard-filter';
import { useTranslations } from 'next-intl';

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
    const contentRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('DashboardPage');

    return (
        <div className='container mx-auto p-4 space-y-6' >
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-bold'>{t('title')}</h1>
                <div className='flex gap-2'>
                    <DashboardFilter />
                    <DashboardPDFDownload contentRef={contentRef} />
                </div>
            </div>
            <div ref={contentRef}>
                {children}
            </div>
        </div>
    );
}