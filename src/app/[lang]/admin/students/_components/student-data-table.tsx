'use client';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';

import { useDataTable } from '@/hooks/use-data-table';
import { getAllAcademicYears } from '@/services/academic-year';
import { getAllClasses } from '@/services/class';

import { getStudentColumns } from './student-table-column';
import React from 'react';
import { TasksTableActionBar } from './student-table-action-bar';
import { getAllStudents } from '@/services/student';
import { DataTableRowAction } from '@/types/data-table';
import { Student } from '@/types/prisma';

interface StudentsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getAllStudents>>,
      Awaited<ReturnType<typeof getAllClasses>>,
      Awaited<ReturnType<typeof getAllAcademicYears>>
    ]
  >;
}

export function StudentDataTable({ promises }: StudentsTableProps) {
  const [{ students, pageCount }, classes, academicYears] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Student> | null>(null);

  const columns = React.useMemo(
    () => getStudentColumns(classes, academicYears),
    [classes, academicYears]
  );

  const { table } = useDataTable({
    data: students,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: 'createdAt', desc: true }]
      // columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true
  });

  return (
    <DataTable table={table} actionBar={<TasksTableActionBar table={table} />}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
