'use client';

import { SemesterWithDetails } from '@/actions/semester';
import { Button } from '@/components/ui/button';
import { AcademicYear } from '@/generated/prisma';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteSemesterDialog } from './delete-semester-modal';
import { SemesterDialog } from './semester-modal';

interface CellActionProps {
  data: SemesterWithDetails;
  academicYear: AcademicYear[];
}
export const SemesterCellAction = ({ data, academicYear }: CellActionProps) => {
  const [deleteDialogOpen, setDeleteDialog] = useState(false);
  const [editDialogOpen, setEditDialog] = useState(false);
  return (
    <>
      <div className='flex justify-end gap-2'>
        <SemesterDialog
          mode='edit'
          semester={data}
          academicYear={academicYear}
          isOpen={editDialogOpen}
          onClose={() => setEditDialog(false)}
        />
        <DeleteSemesterDialog
          semester={{
            id: data.id,
            semesterName: data.semesterName,
            academicYear: data.academicYear
          }}
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialog(false)}
        />

        <Button variant='ghost' size='sm' onClick={() => setEditDialog(true)}>
          <Edit className='h-4 w-4' />
        </Button>
        <Button variant='ghost' size='sm' onClick={() => setDeleteDialog(true)}>
          <Trash2 className='h-4 w-4 text-red-600' />
        </Button>
      </div>
    </>
  );
};
