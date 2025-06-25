'use client';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';

import { useDataTable } from '@/hooks/use-data-table';

import { getResultColumns } from './result-table-column';
import React from 'react';
import { ResultsTableActionBar } from './result-table-action-bar';
import { getAllResults } from '@/actions/result';
import { Button } from '@/components/ui/button';
import { Download, Loader } from 'lucide-react';
import { exportTableToCSV } from '@/lib/export';
import { getAcademicYears } from '@/actions/academic-year';
import { getSemesters } from '@/actions/semester';
import { getClasses } from '@/actions/class';

interface ResultsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getAllResults<true>>>,
      Awaited<ReturnType<typeof getAcademicYears>>,
      Awaited<ReturnType<typeof getSemesters>>,
      Awaited<ReturnType<typeof getClasses>>
    ]
  >;
}

export function ResultDataTable({ promises }: ResultsTableProps) {
  const [{ results, pageCount }, { years }, { semesters }, { classes }] =
    React.use(promises);
  const [isPending, startTransition] = React.useTransition();

  const columns = React.useMemo(
    () =>
      getResultColumns({
        academicYears: years,
        semesters,
        classes
      }),
    [years, semesters, classes]
  );

  const { table } = useDataTable({
    data: results,
    columns,
    pageCount,
    initialState: {
      // sorting: [{ id: 'createdAt', desc: true }],
      columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow) => originalRow.enrollmentId.toString(),
    shallow: false,
    clearOnDefault: true
  });

  const onResultExport = React.useCallback(() => {
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
      actionBar={<ResultsTableActionBar table={table} />}
    >
      <DataTableToolbar table={table}>
        <Button
          aria-label='Export all results'
          variant='outline'
          size='sm'
          className='h-8'
          onClick={onResultExport}
        >
          {isPending ? <Loader /> : <Download />}
          Export All
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}
