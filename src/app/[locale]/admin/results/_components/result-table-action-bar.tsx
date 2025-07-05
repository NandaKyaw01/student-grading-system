'use client';
import type { Table } from '@tanstack/react-table';
import { Download, Trash2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { deleteResults, ResultWithDetails } from '@/actions/result';
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection
} from '@/components/data-table/data-table-action-bar';
import { Separator } from '@/components/ui/separator';
import { Result } from '@/generated/prisma';
import { exportTableToCSV } from '@/lib/export';
import { AlertModal } from '@/components/modal/alert-modal';

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

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction]
  );

  const onResultExport = React.useCallback(() => {
    setCurrentAction('export');
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ['select', 'actions'],
        onlySelected: true
      });
    });
  }, [table]);

  const onResultDelete = React.useCallback(() => {
    setCurrentAction('delete');
    startTransition(async () => {
      const ids = rows.map((row) => row.original.enrollmentId);
      const { error } = await deleteResults(ids);

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
