import { Button } from '@/components/ui/button';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table
} from '@/components/ui/table';
import { SubjectWithDetails } from '@/services/subject';
import { getSubjects } from '@/services/subject';
import { Edit, Trash } from 'lucide-react';
import React, { use } from 'react';
import { SubjectDialog } from './subject-modal';
import { DeleteSubjectDialog } from './delete-subject-modal';

const SubjectsTable = ({
  subjects
}: {
  subjects: Promise<Awaited<ReturnType<typeof getSubjects>>>;
}) => {
  const subjectList = use(subjects) as SubjectWithDetails[];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Subject Name</TableHead>
          <TableHead>Credit Hours</TableHead>
          <TableHead>Exam Weight</TableHead>
          <TableHead>Assignment Weight</TableHead>
          <TableHead className='text-right'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjectList.map((subject) => (
          <TableRow key={subject.id}>
            <TableCell className='font-medium'>{subject.id}</TableCell>
            <TableCell>{subject.subjectName}</TableCell>
            <TableCell>{subject.creditHours}</TableCell>
            <TableCell>{subject.examWeight}</TableCell>
            <TableCell>{subject.assignWeight}</TableCell>
            <TableCell className='text-right'>
              <div className='flex justify-end gap-2'>
                <SubjectDialog mode='edit' subject={subject}>
                  <Button variant='ghost' size='sm'>
                    <Edit className='h-4 w-4' />
                  </Button>
                </SubjectDialog>
                <DeleteSubjectDialog
                  subject={{
                    id: subject.id,
                    subjectName: subject.subjectName
                  }}
                >
                  <Button variant='destructive' size='sm'>
                    <Trash className='h-4 w-4' />
                  </Button>
                </DeleteSubjectDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SubjectsTable;
