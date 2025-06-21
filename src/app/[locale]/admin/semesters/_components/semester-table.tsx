'use client';

import { getAcademicYears } from '@/actions/academic-year';
import { getSemesters } from '@/actions/semester';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import React, { use } from 'react';
import { getSemesterColumns } from './semester-table-column';

interface AcademicYearTableProps {
  semesters: Promise<Awaited<ReturnType<typeof getSemesters>>>;
  academicYear: Promise<Awaited<ReturnType<typeof getAcademicYears>>>;
}

const SemestersTable = ({
  semesters,
  academicYear
}: AcademicYearTableProps) => {
  // const semlist = use(semesters) as SemesterWithDetails[];
  const { semester, pageCount } = use(semesters);
  const columns = React.useMemo(() => getSemesterColumns(), []);
  const { table } = useDataTable({
    data: semester,
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
    //       <TableHead>Semester Name</TableHead>
    //       <TableHead>Academic Year</TableHead>
    //       <TableHead>Status</TableHead>
    //       <TableHead className='text-right'>Actions</TableHead>
    //     </TableRow>
    //   </TableHeader>
    //   <TableBody>
    //     {semesterList.map((semester) => (
    //       <TableRow key={semester.id}>
    //         <TableCell className='font-medium'>
    //           {semester.semesterName}
    //         </TableCell>
    //         <TableCell>{semester.academicYear.yearRange}</TableCell>
    //         <TableCell>
    //           <Badge variant={semester.isCurrent ? 'default' : 'secondary'}>
    //             {semester.isCurrent ? 'Current' : 'Inactive'}
    //           </Badge>
    //         </TableCell>
    //         <TableCell className='text-right'>
    //           <div className='flex justify-end gap-2'>
    //             <SemesterDialog
    //               mode='edit'
    //               semester={semester}
    //               academicYear={academicYear}
    //             >
    //               <Button variant='ghost' size='sm'>
    //                 <Edit className='h-4 w-4' />
    //               </Button>
    //             </SemesterDialog>
    //             <DeleteSemesterDialog
    //               semester={{
    //                 id: semester.id,
    //                 semesterName: semester.semesterName,
    //                 academicYear: semester.academicYear
    //               }}
    //             >
    //               <Button variant='destructive' size='sm'>
    //                 <Trash className='h-4 w-4' />
    //               </Button>
    //             </DeleteSemesterDialog>
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

export default SemestersTable;
