'use client';
import { getAcademicYears } from '@/actions/academic-year';
import { use, useState } from 'react';
import { SemesterDialog } from './semester-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

const CreateSemesterButton = ({
  academicYear
}: {
  academicYear: Promise<Awaited<ReturnType<typeof getAcademicYears>>>;
}) => {
  const [createDialogOpen, setCreateDialog] = useState(false);
  const { years } = use(academicYear);
  const t = useTranslations('SemestersPage');

  return (
    <>
      <SemesterDialog
        mode='new'
        academicYear={years}
        isOpen={createDialogOpen}
        onClose={() => setCreateDialog(false)}
      />

      <Button
        className='text-xs md:text-sm'
        onClick={() => setCreateDialog(true)}
      >
        <Plus className='mr-2 h-4 w-4' /> {t('add_button')}
      </Button>
    </>
  );
};

export default CreateSemesterButton;
