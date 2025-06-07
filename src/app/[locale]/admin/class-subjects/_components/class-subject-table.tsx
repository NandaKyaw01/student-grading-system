// app/(admin)/class-subjects/_components/class-subject-table.tsx
import { ClassWithDetails } from '@/services/class';
import { getClasses } from '@/services/class';
import { ClassSubjectManagerWrapper } from './class-subject-manager-wrapper';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { use } from 'react';

const ClassSubjectsTable = ({
  classes
}: {
  classes: Promise<Awaited<ReturnType<typeof getClasses>>>;
}) => {
  const classList = use(classes) as ClassWithDetails[];

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
        {classList.map((cls) => (
          <TableRow key={cls.id}>
            <TableCell className='font-medium'>{cls.className}</TableCell>
            <TableCell>{cls.departmentCode}</TableCell>
            <TableCell>{cls.semester?.semesterName}</TableCell>
            <TableCell>{cls.semester?.academicYear?.yearRange}</TableCell>
            <TableCell>{cls.subjects?.length || 0} subjects</TableCell>
            <TableCell className='text-right'>
              <ClassSubjectManagerWrapper
                classId={cls.id}
                className={cls.className}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClassSubjectsTable;
