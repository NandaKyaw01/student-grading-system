'use client';

import { getClasses } from '@/actions/class';
import { getSemesters } from '@/actions/semester';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import React, { use } from 'react';
import { getClassColumns } from './class-table-column';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ClassDialog } from './class-modal';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { DeleteClassDialog } from './delete-class-modal';

interface ClassTableProps {
  classProp: Promise<Awaited<ReturnType<typeof getClasses<true>>>>;
}
const ClassesTable = ({ classProp }: ClassTableProps) => {
  // const classList = use(classProp) as ClassWithDetails[];
  const { classes, pageCount } = use(classProp);
  const columns = React.useMemo(() => getClassColumns(), []);
  const { table } = useDataTable({
    data: classes,
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
    //       <TableHead>Class Name</TableHead>
    //       <TableHead>Department Code</TableHead>
    //       <TableHead>Semester</TableHead>
    //       <TableHead>Academic Year</TableHead>
    //       <TableHead className='text-right'>Actions</TableHead>
    //     </TableRow>
    //   </TableHeader>
    //   <TableBody>
    //     {classes.map((cls) => (
    //       <TableRow key={cls.id}>
    //         <TableCell className='font-medium'>{cls.className}</TableCell>
    //         <TableCell>{cls.departmentCode}</TableCell>
    //         <TableCell>{cls.semester?.semesterName}</TableCell>
    //         <TableCell>{cls.semester?.academicYear?.yearRange}</TableCell>
    //         <TableCell className='text-right'>
    //           <div className='flex justify-end gap-2'>
    //             <ClassDialog mode='edit' classData={cls}>
    //               <Button variant='ghost' size='sm'>
    //                 <Edit className='h-4 w-4' />
    //               </Button>
    //             </ClassDialog>
    //             <DeleteClassDialog
    //               classData={{
    //                 id: cls.id,
    //                 className: cls.className
    //               }}
    //             >
    //               <Button variant='destructive' size='sm'>
    //                 <Trash className='h-4 w-4' />
    //               </Button>
    //             </DeleteClassDialog>
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

export default ClassesTable;
