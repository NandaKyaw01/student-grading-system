'use client';

import { deleteEnrollment, EnrollmentWithDetails } from '@/actions/enrollment';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { SquarePen, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { EnrollmentModal } from './enrollment-modal';

interface EnrollmentCellActionProps {
  data: EnrollmentWithDetails;
}

export function EnrollmentCellAction({ data }: EnrollmentCellActionProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteEnrollment(data.id);
        if (!result.success) {
          throw new Error(result.error);
        }
        toast.success('Success', {
          description: 'Enrollment deleted successfully'
        });
      } catch (error) {
        toast.error('Error', {
          description:
            error instanceof Error
              ? error.message
              : 'Failed to delete enrollment'
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
