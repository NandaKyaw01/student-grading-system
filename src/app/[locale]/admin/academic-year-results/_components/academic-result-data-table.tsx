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
import { exportAcademicYearResultsToExcel } from '@/actions/export-result';
import { toast } from 'sonner';

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

  const onResultExport = React.useCallback(async () => {
    startTransition(async () => {
      try {
        const result = await exportAcademicYearResultsToExcel();

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
          {isPending ? <Loader className='animate-spin' /> : <Download />}
          Export All
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}
