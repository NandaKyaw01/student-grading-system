'use client';
import { deleteResult } from '@/actions/result';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Result } from '@/generated/prisma';
import { EllipsisVertical, SquarePen, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: Result;
}

export const ResultCellAction: React.FC<CellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isDeletePending, startDeleteTransition] = React.useTransition();
  const t = useTranslations('ResultsBySemester');

  const onConfirm = async () => {
    startDeleteTransition(async () => {
      const { error } = await deleteResult(data.enrollmentId);

      if (error) {
        toast.error(t('delete.error', { message: error }));
        return;
      }

      toast.success(t('delete.success'));
    });
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={isDeletePending}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <EllipsisVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => router.push(`/admin/results/${data.enrollmentId}`)}
          >
            <SquarePen className='mr-2 h-4 w-4' />
            {t('table.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash2 className='mr-2 h-4 w-4' />
            {t('table.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
