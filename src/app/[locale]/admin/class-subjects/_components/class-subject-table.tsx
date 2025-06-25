// app/(admin)/class-subjects/_components/class-subject-table.tsx
import { ClassWithDetails } from '@/actions/class';
import { getClasses } from '@/actions/class';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { use } from 'react';
import { ClassSubjectManager } from './class-subject-manager';

interface ClassTableProps {
  classProp: Promise<Awaited<ReturnType<typeof getClasses>>>;
}

const ClassSubjectsTable = ({ classProp }: ClassTableProps) => {
  const { classes, pageCount } = use(classProp);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Class Name</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Semester</TableHead>
          <TableHead>Academic Year</TableHead>
          <TableHead>Assigned Subjects</TableHead>
          <TableHead className='text-right'>Manage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.map((cls) => (
          <TableRow key={cls.id}>
            <TableCell className='font-medium'>{cls.className}</TableCell>
            <TableCell>{cls.departmentCode}</TableCell>
            <TableCell>{cls.semester?.semesterName}</TableCell>
            <TableCell>{cls.semester?.academicYear?.yearRange}</TableCell>
            <TableCell>{cls.subjects?.length || 0} subjects</TableCell>
            <TableCell className='text-right'>
              <ClassSubjectManager classId={cls.id} className={cls.className} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClassSubjectsTable;
