'use client';

import React from 'react';
import { Semester } from '@/generated/prisma';
import { SemesterWithDetails } from '@/actions/semester';
import { AcademicYear } from '@/generated/prisma';
import { Button } from '@/components/ui/button';
import { SemesterDialog } from './semester-modal';
import { Edit, Trash } from 'lucide-react';
import { DeleteSemesterDialog } from './delete-semester-modal';
import { getAcademicYears } from '@/actions/academic-year';

interface CellActionProps {
  data: SemesterWithDetails;
  academicYear: Promise<Awaited<ReturnType<typeof getAcademicYears>>>;
}
export const SemesterCellAction = ({ data, academicYear }: CellActionProps) => {
  return (
    <>
      <div className='flex justify-end gap-2'>
        <SemesterDialog mode='edit' semester={data} academicYear={academicYear}>
          <Button variant='ghost' size='sm'>
            <Edit className='h-4 w-4' />
          </Button>
        </SemesterDialog>
        <DeleteSemesterDialog
          semester={{
            id: data.id,
            semesterName: data.semesterName,
            academicYear: data.academicYear
          }}
        >
          <Button variant='destructive' size='sm'>
            <Trash className='h-4 w-4' />
          </Button>
        </DeleteSemesterDialog>
      </div>
    </>
  );
};
