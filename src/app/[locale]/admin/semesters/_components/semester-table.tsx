import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table
} from '@/components/ui/table';
import { SemesterWithDetails } from '@/actions/semester';
import { getSemesters } from '@/actions/semester';
import { Edit, Trash } from 'lucide-react';
import React, { use } from 'react';
import { SemesterDialog } from './semester-modal';
import { DeleteSemesterDialog } from './delete-semester-modal';
import { getAcademicYears } from '@/actions/academic-year';

const SemestersTable = ({
  semesters,
  academicYear
}: {
  semesters: Promise<Awaited<ReturnType<typeof getSemesters>>>;
  academicYear: Promise<Awaited<ReturnType<typeof getAcademicYears>>>;
}) => {
  const semesterList = use(semesters) as SemesterWithDetails[];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Semester Name</TableHead>
          <TableHead>Academic Year</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className='text-right'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {semesterList.map((semester) => (
          <TableRow key={semester.id}>
            <TableCell className='font-medium'>
              {semester.semesterName}
            </TableCell>
            <TableCell>{semester.academicYear.yearRange}</TableCell>
            <TableCell>
              <Badge variant={semester.isCurrent ? 'default' : 'secondary'}>
                {semester.isCurrent ? 'Current' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className='text-right'>
              <div className='flex justify-end gap-2'>
                <SemesterDialog
                  mode='edit'
                  semester={semester}
                  academicYear={academicYear}
                >
                  <Button variant='ghost' size='sm'>
                    <Edit className='h-4 w-4' />
                  </Button>
                </SemesterDialog>
                <DeleteSemesterDialog
                  semester={{
                    id: semester.id,
                    semesterName: semester.semesterName,
                    academicYear: semester.academicYear
                  }}
                >
                  <Button variant='destructive' size='sm'>
                    <Trash className='h-4 w-4' />
                  </Button>
                </DeleteSemesterDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SemestersTable;
