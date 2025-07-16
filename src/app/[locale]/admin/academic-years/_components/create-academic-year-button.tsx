'use client';
import { useState } from 'react';
import { AcademicYearDialog } from './academic-year-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

const CreateAcademicYearButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const t = useTranslations('AcademicYearsPage');

  return (
    <>
      <AcademicYearDialog
        mode='new'
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />

      <Button
        className='text-xs md:text-sm'
        onClick={() => setDialogOpen(true)}
      >
        <Plus className='h-4 w-4' /> {t('add_button')}
      </Button>
    </>
  );
};

export default CreateAcademicYearButton;
