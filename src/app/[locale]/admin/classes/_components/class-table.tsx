import { Button } from '@/components/ui/button';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table
} from '@/components/ui/table';
import { ClassWithDetails } from '@/services/class';
import { getClasses } from '@/services/class';
import { Edit, Trash } from 'lucide-react';
import React, { use } from 'react';
import { ClassDialog } from './class-modal';
import { DeleteClassDialog } from './delete-class-modal';
import { getSemesters } from '@/services/semester';

const ClassesTable = ({
  classes,
  semester
}: {
  classes: Promise<Awaited<ReturnType<typeof getClasses>>>;
  semester: Promise<Awaited<ReturnType<typeof getSemesters>>>;
}) => {
  const classList = use(classes) as ClassWithDetails[];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Class Name</TableHead>
          <TableHead>Department Code</TableHead>
          <TableHead>Semester</TableHead>
          <TableHead>Academic Year</TableHead>
          <TableHead className='text-right'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classList.map((cls) => (
          <TableRow key={cls.id}>
            <TableCell className='font-medium'>{cls.className}</TableCell>
            <TableCell>{cls.departmentCode}</TableCell>
            <TableCell>{cls.semester?.semesterName}</TableCell>
            <TableCell>{cls.semester?.academicYear?.yearRange}</TableCell>
            <TableCell className='text-right'>
              <div className='flex justify-end gap-2'>
                <ClassDialog mode='edit' classData={cls} semester={semester}>
                  <Button variant='ghost' size='sm'>
                    <Edit className='h-4 w-4' />
                  </Button>
                </ClassDialog>
                <DeleteClassDialog
                  classData={{
                    id: cls.id,
                    className: cls.className
                  }}
                >
                  <Button variant='destructive' size='sm'>
                    <Trash className='h-4 w-4' />
                  </Button>
                </DeleteClassDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClassesTable;
