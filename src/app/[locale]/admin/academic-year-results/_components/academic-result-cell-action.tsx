'use client';
import { deleteAcademicResult } from '@/actions/academic-result';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { AcademicYearResult } from '@/generated/prisma';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: AcademicYearResult;
}

export const AcademicResultCellAction: React.FC<CellActionProps> = ({
  data
}) => {
  const t = useTranslations('AcademicYearResultsPage.CellAction');
  const [open, setOpen] = useState(false);
  const [isDeletePending, startDeleteTransition] = React.useTransition();

  const onConfirm = async () => {
    startDeleteTransition(async () => {
      const { error } = await deleteAcademicResult(data.id);

      if (error) {
        toast.error(error);
        return;
      }

      toast.success(t('delete_success'));
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
      <Button variant={'ghost'} onClick={() => setOpen(true)}>
        <Trash2 className='h-4 w-4 text-destructive' />
      </Button>
    </>
  );
};
