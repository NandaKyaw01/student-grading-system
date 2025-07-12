'use client';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';

import { useDataTable } from '@/hooks/use-data-table';

import { getAcademicYears } from '@/actions/academic-year';
import { getClasses } from '@/actions/class';
import { getAllResults } from '@/actions/result';
import { getSemesters } from '@/actions/semester';
import { Button } from '@/components/ui/button';
import { exportTableToCSV } from '@/lib/export';
import { Download, Loader } from 'lucide-react';
import React from 'react';
import { ResultsTableActionBar } from './result-table-action-bar';
import { getResultColumns } from './result-table-column';
import { exportTableToExcel } from '@/actions/export-result';
import { toast } from 'sonner';

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

  const onResultExport = React.useCallback(async () => {
    startTransition(async () => {
      try {
        const result = await exportTableToExcel();

        if (result.success) {
          // Create download link
          const link = document.createElement('a');
          link.href = `data:${result.contentType};base64,${result.data}`;
          link.download = result.fileName ?? 'results.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast.success('Excel file downloaded successfully!');
        } else {
          toast.error(`Export failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Export failed. Please try again.');
      }
    });
  }, [startTransition]);

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
          {isPending ? <Loader className='animate-spin' /> : <Download />}
          Export All
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}
