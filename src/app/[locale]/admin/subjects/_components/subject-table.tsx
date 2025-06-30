'use client';

import { getSubjects } from '@/actions/subject';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import React, { use } from 'react';
import { getSubjectColumns } from './subject-table-column';

const SubjectsTable = ({
  subjectProp
}: {
  subjectProp: Promise<Awaited<ReturnType<typeof getSubjects<true>>>>;
}) => {
  const { subjects, pageCount } = use(subjectProp);

  const columns = React.useMemo(() => getSubjectColumns(), []);
  const { table } = useDataTable({
    data: subjects,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: 'id', desc: true }],
      columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true
  });

  return (
    // <Table>
    //   <TableHeader>
    //     <TableRow>
    //       <TableHead>ID</TableHead>
    //       <TableHead>Subject Name</TableHead>
    //       <TableHead>Credit Hours</TableHead>
    //       <TableHead>Exam Weight</TableHead>
    //       <TableHead>Assignment Weight</TableHead>
    //       <TableHead className='text-right'>Actions</TableHead>
    //     </TableRow>
    //   </TableHeader>
    //   <TableBody>
    //     {subjects.map((subject) => (
    //       <TableRow key={subject.id}>
    //         <TableCell className='font-medium'>{subject.id}</TableCell>
    //         <TableCell>{subject.subjectName}</TableCell>
    //         <TableCell>{subject.creditHours}</TableCell>
    //         <TableCell>{subject.examWeight}</TableCell>
    //         <TableCell>{subject.assignWeight}</TableCell>
    //         <TableCell className='text-right'>
    //           <div className='flex justify-end gap-2'>
    //             <SubjectDialog mode='edit' subject={subject}>
    //               <Button variant='ghost' size='sm'>
    //                 <Edit className='h-4 w-4' />
    //               </Button>
    //             </SubjectDialog>
    //             <DeleteSubjectDialog
    //               subject={{
    //                 id: subject.id,
    //                 subjectName: subject.subjectName
    //               }}
    //             >
    //               <Button variant='destructive' size='sm'>
    //                 <Trash className='h-4 w-4' />
    //               </Button>
    //             </DeleteSubjectDialog>
    //           </div>
    //         </TableCell>
    //       </TableRow>
    //     ))}
    //   </TableBody>
    // </Table>
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
};

export default SubjectsTable;
