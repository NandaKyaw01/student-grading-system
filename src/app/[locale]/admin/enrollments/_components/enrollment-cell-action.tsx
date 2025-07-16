'use client';

import { deleteEnrollment, EnrollmentWithDetails } from '@/actions/enrollment';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { SquarePen, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { EnrollmentModal } from './enrollment-modal';
import { useTranslations } from 'next-intl';

interface EnrollmentCellActionProps {
  data: EnrollmentWithDetails;
}

export function EnrollmentCellAction({ data }: EnrollmentCellActionProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('EnrollmentsPage');

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteEnrollment(data.id);
        if (!result.success) {
          throw new Error(result.error);
        }
        toast.success(t('cell_action.success'), {
          description: t('cell_action.delete_success')
        });
      } catch (error) {
        toast.error(t('cell_action.error'), {
          description:
            error instanceof Error
              ? error.message
              : t('cell_action.delete_error')
        });
      }
    });
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        loading={isPending}
      />
      <EnrollmentModal enrollment={data}>
        <Button variant='ghost'>
          <SquarePen className='h-4 w-4' />
        </Button>
      </EnrollmentModal>
      <Button variant='ghost' onClick={() => setOpen(true)}>
        <Trash2 className='h-4 w-4 text-destructive' />
      </Button>
    </>
  );
}
