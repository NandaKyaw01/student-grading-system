'use client';

import { useState } from 'react';
import { AcademicYear } from '@/generated/prisma';
import { AcademicYearDialog } from './academic-year-modal';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Trash2 } from 'lucide-react';
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
      <div className='flex justify-end gap-1'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setAcademicDialogOpen(true)}
        >
          <Edit className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className='h-6 w-6 text-red-600' />
        </Button>
      </div>
    </>
  );
};
