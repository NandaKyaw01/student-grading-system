'use client';
import type { Table } from '@tanstack/react-table';
import { Download, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import {
  deleteEnrollments,
  EnrollmentWithDetails,
  updateEnrollmentStatus
} from '@/actions/enrollment';
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection
} from '@/components/data-table/data-table-action-bar';
import { Separator } from '@/components/ui/separator';
import { Enrollment } from '@/generated/prisma';
import { exportTableToCSV } from '@/lib/export';

const actions = ['update-status', 'export', 'delete'] as const;

type Action = (typeof actions)[number];

interface EnrollmentsTableActionBarProps {
  table: Table<EnrollmentWithDetails>;
}

export function EnrollmentsTableActionBar({
  table
}: EnrollmentsTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction]
  );

  const onEnrollmentExport = React.useCallback(() => {
    setCurrentAction('export');
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ['select', 'actions'],
        onlySelected: true
      });
    });
  }, [table]);

  const onEnrollmentDelete = React.useCallback(() => {
    setCurrentAction('delete');
    startTransition(async () => {
      const ids = rows.map((row) => row.original.id);
      const { error } = await deleteEnrollments(ids);

      if (error) {
        toast.error(error);
        return;
      }
      table.toggleAllRowsSelected(false);
    });
  }, [rows, table]);

  const onStatusToggle = React.useCallback(
    (status: boolean) => {
      setCurrentAction('update-status');
      startTransition(async () => {
        const ids = rows.map((row) => row.original.id);
        const { error } = await updateEnrollmentStatus(ids, status);

        if (error) {
          toast.error(error);
          return;
        }
        table.toggleAllRowsSelected(false);
      });
    },
    [rows, table]
  );

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        orientation='vertical'
        className='hidden data-[orientation=vertical]:h-5 sm:block'
      />
      <div className='flex items-center gap-1.5'>
        <DataTableActionBarAction
          size='icon'
          tooltip='Activate enrollments'
          isPending={getIsActionPending('update-status')}
          onClick={() => onStatusToggle(true)}
        >
          <ToggleRight />
        </DataTableActionBarAction>
        <DataTableActionBarAction
          size='icon'
          tooltip='Deactivate enrollments'
          isPending={getIsActionPending('update-status')}
          onClick={() => onStatusToggle(false)}
        >
          <ToggleLeft />
        </DataTableActionBarAction>
        <DataTableActionBarAction
          size='icon'
          tooltip='Export enrollments'
          isPending={getIsActionPending('export')}
          onClick={onEnrollmentExport}
        >
          <Download />
        </DataTableActionBarAction>
        <DataTableActionBarAction
          size='icon'
          tooltip='Delete enrollments'
          isPending={getIsActionPending('delete')}
          onClick={onEnrollmentDelete}
        >
          <Trash2 />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  );
}
