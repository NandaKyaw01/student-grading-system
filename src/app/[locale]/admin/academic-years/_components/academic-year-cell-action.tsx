'use client';

import { useState } from 'react';
import { AcademicYear } from '@/generated/prisma';
import { AcademicYearDialog } from './academic-year-modal';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { DeleteAcademicYearDialog } from './delete-academic-year-modal';

interface CellActionProps {
  data: AcademicYear;
}
export const AcademicYearCellAction = ({ data }: CellActionProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [academicDialogOpen, setAcademicDialogOpen] = useState(false);

  return (
    <>
      <DeleteAcademicYearDialog
        academicYear={data}
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
      <AcademicYearDialog
        mode='edit'
        academicYear={data}
        isOpen={academicDialogOpen}
        onClose={() => setAcademicDialogOpen(false)}
      />
      <div className='flex justify-end gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setAcademicDialogOpen(true)}
        >
          <Edit className='h-4 w-4' />
        </Button>
        <Button
          variant='destructive'
          size='sm'
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash className='h-4 w-4' />
        </Button>
      </div>
    </>
  );
};
