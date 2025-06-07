'use client';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { getEnrollmentColumns } from './enrollment-table-column';
import React from 'react';
import { EnrollmentsTableActionBar } from './enrollment-table-action-bar';
import { EnrollmentWithDetails, getAllEnrollments } from '@/actions/enrollment';
import { Button } from '@/components/ui/button';
import { Download, Loader } from 'lucide-react';
import { exportTableToCSV } from '@/lib/export';

interface EnrollmentsTableProps {
  promises: Promise<{
    enrollments: EnrollmentWithDetails[];
    pageCount: number;
  }>;
}

export function EnrollmentDataTable({ promises }: EnrollmentsTableProps) {
  const { enrollments, pageCount } = React.use(promises);
  const [isPending, startTransition] = React.useTransition();

  const columns = React.useMemo(() => getEnrollmentColumns(), []);

  const { table } = useDataTable({
    data: enrollments,
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

  const onEnrollmentExport = React.useCallback(() => {
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ['select', 'actions'],
        onlySelected: false
      });
    });
  }, [table]);

  return (
    <DataTable
      table={table}
      actionBar={<EnrollmentsTableActionBar table={table} />}
    >
      <DataTableToolbar table={table}>
        <Button
          aria-label='Export all enrollments'
          variant='outline'
          size='sm'
          className='h-8'
          onClick={onEnrollmentExport}
        >
          {isPending ? <Loader /> : <Download />}
          Export All
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}
