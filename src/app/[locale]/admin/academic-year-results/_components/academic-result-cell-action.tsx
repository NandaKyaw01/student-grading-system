'use client';
import { deleteAcademicResult } from '@/actions/academic-result';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { AcademicYearResult } from '@/generated/prisma';
import { EllipsisVertical, SquarePen, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: AcademicYearResult;
}

export const AcademicResultCellAction: React.FC<CellActionProps> = ({
  data
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isDeletePending, startDeleteTransition] = React.useTransition();

  const onConfirm = async () => {
    startDeleteTransition(async () => {
      const { error } = await deleteAcademicResult(data.id);

      if (error) {
        toast.error(error);
        return;
      }

      toast.success('Result deleted');
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
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => router.push(`/admin/results/${data.id}`)}
          >
            <SquarePen className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash2 className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
