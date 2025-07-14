'use client';
import type { Table } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { deleteGradeScales } from '@/actions/grade-scale';
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection
} from '@/components/data-table/data-table-action-bar';
import { Separator } from '@/components/ui/separator';
import { GradeScale } from '@/generated/prisma';
import { DeleteGradeScaleDialog } from './grade-scale-delete-modal';
import { useTranslations } from 'next-intl';

const actions = ['export', 'delete'] as const;

type Action = (typeof actions)[number];

interface ResultsTableActionBarProps {
  table: Table<GradeScale>;
}

export function GradeScalesTableActionBar({
  table
}: ResultsTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const t = useTranslations('GpaSettingPage.action_bar');

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction]
  );

  const onDelete = React.useCallback(() => {
    setCurrentAction('delete');
    startTransition(async () => {
      const ids = rows.map((row) => row.original.id);
      const { error } = await deleteGradeScales(ids);

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
      <DeleteGradeScaleDialog
        isDeleting={getIsActionPending('delete')}
        handleDelete={onDelete}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
            onClick={() => setIsModalOpen(true)}
          >
            <Trash2 />
          </DataTableActionBarAction>
        </div>
      </DataTableActionBar>
    </>
  );
}
