'use client';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { getGradeScaleColumns } from './grade-scale-table-column';
import React from 'react';
import { GradeScalesTableActionBar } from './grade-scale-action-bar';
import { getAllGradeScales } from '@/actions/grade-scale';
import { Button } from '@/components/ui/button';
import { Download, Loader } from 'lucide-react';
import { exportTableToCSV } from '@/lib/export';
import { GradeScaleModal } from './grade-scale-modal';

interface GradeScalesTableProps {
  promises: Promise<Awaited<ReturnType<typeof getAllGradeScales>>>;
}

export function GradeScaleDataTable({ promises }: GradeScalesTableProps) {
  const gradeScales = React.use(promises);
  const [isPending, startTransition] = React.useTransition();

  const columns = React.useMemo(() => getGradeScaleColumns(), []);

  const { table } = useDataTable({
    data: gradeScales,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: 'minMark', desc: false }],
      columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true
  });

  const onGradeScaleExport = React.useCallback(() => {
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
      actionBar={<GradeScalesTableActionBar table={table} />}
    >
      <DataTableToolbar table={table}>
        <GradeScaleModal>
          <Button size='sm' className='h-8'>
            New Grade Scale
          </Button>
        </GradeScaleModal>
        <Button
          aria-label='Export all grade scales'
          variant='outline'
          size='sm'
          className='h-8'
          onClick={onGradeScaleExport}
        >
          {isPending ? <Loader /> : <Download />}
          Export All
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}
