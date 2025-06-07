'use client';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';

import { useDataTable } from '@/hooks/use-data-table';

import { getStudentColumns } from './student-table-column';
import React from 'react';
import { TasksTableActionBar } from './student-table-action-bar';
import { getAllStudents } from '@/services/student';
import { Button } from '@/components/ui/button';
import { Download, Loader } from 'lucide-react';
import { exportTableToCSV } from '@/lib/export';

interface StudentsTableProps {
  promises: Promise<Awaited<ReturnType<typeof getAllStudents>>>;
}

export function StudentDataTable({ promises }: StudentsTableProps) {
  const { students, pageCount } = React.use(promises);
  const [isPending, startTransition] = React.useTransition();

  const columns = React.useMemo(() => getStudentColumns(), []);

  const { table } = useDataTable({
    data: students,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: 'createdAt', desc: true }],
      columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true
  });

  const onStudentExport = React.useCallback(() => {
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ['select', 'actions'],
        onlySelected: false
      });
    });
  }, [table]);

  return (
    <DataTable table={table} actionBar={<TasksTableActionBar table={table} />}>
      <DataTableToolbar table={table}>
        <Button
          aria-label='Export all students'
          variant='outline'
          size='sm'
          className='h-8'
          onClick={onStudentExport}
        >
          {isPending ? <Loader /> : <Download />}
          Export All
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}
