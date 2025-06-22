'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AcademicYearDialog } from './academic-year-modal';

export const AcademicYearCreateButton = () => {
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
        <Plus className='mr-2 h-4 w-4' /> Add New
      </Button>
    </>
  );
};
