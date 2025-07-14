'use client';

import { deleteGradeScale } from '@/actions/grade-scale';
import { Button } from '@/components/ui/button';
import { GradeScale } from '@/generated/prisma';
import { Edit, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { DeleteGradeScaleDialog } from './grade-scale-delete-modal';
import { GradeScaleModal } from './grade-scale-modal';

interface GradeScaleCellActionProps {
  data: GradeScale;
}

export function GradeScaleCellAction({ data }: GradeScaleCellActionProps) {
  const [deleteDialogOpoen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteGradeScale(data.id);
        if (!result.success) {
          throw new Error(result.error);
        }
        toast('Success', {
          description: 'Grade scale deleted successfully'
        });
      } catch (error) {
        toast.error('Error', {
          description:
            error instanceof Error
              ? error.message
              : 'Failed to delete grade scale'
        });
      }
    });
  };

  return (
    <>
      <DeleteGradeScaleDialog
        handleDelete={handleDelete}
        isDeleting={isPending}
        isOpen={deleteDialogOpoen}
        onClose={() => setDeleteDialogOpen(false)}
      />
      <div className='flex justify-end gap-1'>
        <GradeScaleModal gradeScale={data}>
          <Button variant='ghost' size='sm'>
            <Edit className='h-4 w-4' />
          </Button>
        </GradeScaleModal>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className='h-6 w-6 text-red-600' />
        </Button>
      </div>
    </>
  );
}
