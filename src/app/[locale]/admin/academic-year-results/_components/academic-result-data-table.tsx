'use client';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';

import { useDataTable } from '@/hooks/use-data-table';

import { getAllAcademicYearResults } from '@/actions/academic-result';
import { getAcademicYears } from '@/actions/academic-year';
import { Button } from '@/components/ui/button';
import { exportTableToCSV } from '@/lib/export';
import { Download, Loader } from 'lucide-react';
import React from 'react';
import { AcademicResultsTableActionBar } from './academic-result-table-action-bar';
import { getAcademicResultColumns } from './academic-result-table-column';
import { getClasses } from '@/actions/class';

interface ResultsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getAllAcademicYearResults<true>>>,
      Awaited<ReturnType<typeof getAcademicYears<true>>>,
      Awaited<ReturnType<typeof getClasses<false>>>
    ]
  >;
}

export function AcademicResultDataTable({ promises }: ResultsTableProps) {
  const [{ results, pageCount }, { years }, { classes }] = React.use(promises);
  const [isPending, startTransition] = React.useTransition();

  const columns = React.useMemo(
    () =>
      getAcademicResultColumns({
        academicYears: years,
        classes
      }),
    [years, classes]
  );

  const { table } = useDataTable({
    data: results,
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
      actionBar={<AcademicResultsTableActionBar table={table} />}
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
