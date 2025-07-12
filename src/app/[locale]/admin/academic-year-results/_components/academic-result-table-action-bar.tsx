'use client';
import type { Table } from '@tanstack/react-table';
import { Download, Trash2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import {
  AcademicYearResultWithDetails,
  deleteAcademicResults
} from '@/actions/academic-result';
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection
} from '@/components/data-table/data-table-action-bar';
import { Separator } from '@/components/ui/separator';
import { exportTableToCSV } from '@/lib/export';
import { AlertModal } from '@/components/modal/alert-modal';
import { exportAcademicYearResultsToExcel } from '@/actions/export-result';

const actions = ['export', 'delete'] as const;

type Action = (typeof actions)[number];

interface AcademicResultsTableActionBarProps {
  table: Table<AcademicYearResultWithDetails>;
}

export function AcademicResultsTableActionBar({
  table
}: AcademicResultsTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);
  const [open, setOpen] = React.useState(false);

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction]
  );

  const onResultExport = React.useCallback(async () => {
    setCurrentAction('export');
    const ids = rows.map((row) => row.original.id);

    startTransition(async () => {
      try {
        const result = await exportAcademicYearResultsToExcel(ids);

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
      } finally {
        setCurrentAction(null);
      }
    });
  }, [rows, startTransition]);

  const onResultDelete = React.useCallback(() => {
    setCurrentAction('delete');
    startTransition(async () => {
      const ids = rows.map((row) => row.original.id);
      const { error } = await deleteAcademicResults(ids);

      if (error) {
        toast.error(error);
        return;
      }
      table.toggleAllRowsSelected(false);
    });
  }, [rows, table]);

  return (
    <>
      <AlertModal
        isOpen={open}
        loading={getIsActionPending('delete')}
        onClose={() => setOpen(false)}
        onConfirm={onResultDelete}
      />
      <DataTableActionBar table={table} visible={rows.length > 0}>
        <DataTableActionBarSelection table={table} />
        <Separator
          orientation='vertical'
          className='hidden data-[orientation=vertical]:h-5 sm:block'
        />
        <div className='flex items-center gap-1.5'>
          <DataTableActionBarAction
            size='icon'
            tooltip='Export results'
            isPending={getIsActionPending('export')}
            onClick={onResultExport}
          >
            <Download />
          </DataTableActionBarAction>
          <DataTableActionBarAction
            size='icon'
            tooltip='Delete results'
            isPending={getIsActionPending('delete')}
            onClick={() => setOpen(true)}
          >
            <Trash2 />
          </DataTableActionBarAction>
        </div>
      </DataTableActionBar>
    </>
  );
}
