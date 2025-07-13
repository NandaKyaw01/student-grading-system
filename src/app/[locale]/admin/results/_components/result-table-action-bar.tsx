'use client';
import type { Table } from '@tanstack/react-table';
import { Download, Trash2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { exportTableToExcel } from '@/actions/export-result';
import { deleteResults, ResultWithDetails } from '@/actions/result';
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection
} from '@/components/data-table/data-table-action-bar';
import { AlertModal } from '@/components/modal/alert-modal';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

const actions = ['export', 'delete'] as const;

type Action = (typeof actions)[number];

interface ResultsTableActionBarProps {
  table: Table<ResultWithDetails>;
}

export function ResultsTableActionBar({ table }: ResultsTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);
  const [open, setOpen] = React.useState(false);
  const t = useTranslations('ResultsBySemester');

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction]
  );

  const onResultExport = React.useCallback(async () => {
    setCurrentAction('export');
    const ids = rows.map((row) => row.original.enrollmentId);

    startTransition(async () => {
      try {
        const result = await exportTableToExcel(ids);

        if (result.success) {
          // Create download link
          const link = document.createElement('a');
          link.href = `data:${result.contentType};base64,${result.data}`;
          link.download = result.fileName ?? 'results.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast.success(t('export.success'));
        } else {
          toast.error(t('export.error', { message: result.error ?? '' }));
        }
      } catch (error) {
        console.error('Export error:', error);
        toast.error(t('export.generic_error'));
      } finally {
        setCurrentAction(null);
      }
    });
  }, [rows, startTransition, t]);

  const onResultDelete = React.useCallback(() => {
    setCurrentAction('delete');
    startTransition(async () => {
      const ids = rows.map((row) => row.original.enrollmentId);
      const { error } = await deleteResults(ids);

      if (error) {
        toast.error(t('delete.error', { message: error }));
        return;
      }

      toast.success(t('delete.success'));
      table.toggleAllRowsSelected(false);
    });
  }, [rows, table, t]);

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
            tooltip={t('export_selected')}
            isPending={getIsActionPending('export')}
            onClick={onResultExport}
          >
            <Download />
          </DataTableActionBarAction>
          <DataTableActionBarAction
            size='icon'
            tooltip={t('delete_selected')}
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
