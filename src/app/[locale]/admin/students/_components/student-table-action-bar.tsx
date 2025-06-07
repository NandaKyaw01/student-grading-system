'use client';
import type { Table } from '@tanstack/react-table';
import { Download, Trash2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { deleteStudents } from '@/actions/student';
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection
} from '@/components/data-table/data-table-action-bar';
import { Separator } from '@/components/ui/separator';
import { Student } from '@/generated/prisma';
import { exportTableToCSV } from '@/lib/export';
// import { exportTableToCSV } from "@/lib/export";
// import { deleteTasks, updateTasks } from "../_lib/actions";

const actions = [
  'update-status',
  'update-priority',
  'export',
  'delete'
] as const;

type Action = (typeof actions)[number];

interface TasksTableActionBarProps {
  table: Table<Student>;
}

export function TasksTableActionBar({ table }: TasksTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction]
  );

  const onStudentExport = React.useCallback(() => {
    setCurrentAction('export');
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ['select', 'actions'],
        onlySelected: true
      });
    });
  }, [table]);

  const onStudentDelete = React.useCallback(() => {
    setCurrentAction('delete');
    startTransition(async () => {
      const ids = rows.map((row) => row.original.id);
      const { error } = await deleteStudents(ids);

      if (error) {
        toast.error(error);
        return;
      }
      table.toggleAllRowsSelected(false);
    });
  }, [rows, table]);

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
          tooltip='Export tasks'
          isPending={getIsActionPending('export')}
          onClick={onStudentExport}
        >
          <Download />
        </DataTableActionBarAction>
        <DataTableActionBarAction
          size='icon'
          tooltip='Delete tasks'
          isPending={getIsActionPending('delete')}
          onClick={onStudentDelete}
        >
          <Trash2 />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  );
}
