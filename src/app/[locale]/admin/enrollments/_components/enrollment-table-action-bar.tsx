'use client';
import type { Table } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { deleteEnrollments, EnrollmentWithDetails } from '@/actions/enrollment';
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection
} from '@/components/data-table/data-table-action-bar';
import { AlertModal } from '@/components/modal/alert-modal';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

const actions = ['update-status', 'export', 'delete'] as const;

type Action = (typeof actions)[number];

interface EnrollmentsTableActionBarProps {
  table: Table<EnrollmentWithDetails>;
}

export function EnrollmentsTableActionBar({
  table
}: EnrollmentsTableActionBarProps) {
  const t = useTranslations('EnrollmentsPage.table');
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);
  const [open, setOpen] = React.useState(false);

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction]
  );

  const onEnrollmentDelete = React.useCallback(() => {
    setCurrentAction('delete');
    startTransition(async () => {
      const ids = rows.map((row) => row.original.id);
      const { error } = await deleteEnrollments(ids);

      if (error) {
        toast.error(error);
        return;
      }

      toast.success(t('delete_success'));
      table.toggleAllRowsSelected(false);
    });
  }, [rows, table, t]);

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onEnrollmentDelete}
        loading={getIsActionPending('delete')}
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
            tooltip={t('delete_tooltip')}
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
