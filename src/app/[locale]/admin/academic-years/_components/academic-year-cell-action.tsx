'use client';

import React from 'react';
import { AcademicYear } from '@/generated/prisma';
import { AcademicYearDialog } from './academic-year-modal';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { DeleteAcademicYearDialog } from './delete-academic-year-modal';

interface CellActionProps {
  data: AcademicYear;
}
export const AcademicYearCellAction = ({ data }: CellActionProps) => {
  return (
    <>
      <div className='flex justify-end gap-2'>
        <AcademicYearDialog mode='edit' academicYear={data}>
          <Button variant='ghost' size='sm'>
            <Edit className='h-4 w-4' />
          </Button>
        </AcademicYearDialog>
        <DeleteAcademicYearDialog
          academicYear={{ id: data.id, yearRange: data.yearRange }}
        >
          <Button variant='destructive' size='sm'>
            <Trash className='h-4 w-4' />
          </Button>
        </DeleteAcademicYearDialog>
      </div>
    </>
  );
};
