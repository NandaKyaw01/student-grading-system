'use client';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';

import { useDataTable } from '@/hooks/use-data-table';

import { getAllStudents } from '@/actions/student';
import { useTranslations } from 'next-intl';
import React from 'react';
import { TasksTableActionBar } from './student-table-action-bar';
import { getStudentColumns } from './student-table-column';

interface StudentsTableProps {
  promises: Promise<Awaited<ReturnType<typeof getAllStudents>>>;
}

export function StudentDataTable({ promises }: StudentsTableProps) {
  const { students, pageCount } = React.use(promises);
  const t = useTranslations('StudentsPage.table');

  const columns = React.useMemo(() => getStudentColumns(t), [t]);

  const { table } = useDataTable({
    data: students,
    columns,
    pageCount,
    initialState: {
      // sorting: [{ id: 'createdAt', desc: true }],
      columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true
  });

  return (
    <DataTable table={table} actionBar={<TasksTableActionBar table={table} />}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
