'use client';
import { useState } from 'react';
import { AcademicYearDialog } from './academic-year-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const CreateAcademicYearButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

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
        <Plus className='mr-2 h-4 w-4' /> Add New Year
      </Button>
    </>
  );
};

export default CreateAcademicYearButton;
