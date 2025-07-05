'use client';
import { deleteStudent } from '@/actions/student';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Student } from '@/generated/prisma';
import { SquarePen, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { StudentDialog } from './student-modal';

interface CellActionProps {
  data: Student;
}

export const StudentCellAction: React.FC<CellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [isDeletePending, startDeleteTransition] = React.useTransition();

  const onConfirm = () => {
    startDeleteTransition(async () => {
      const { error } = await deleteStudent(data.id);

      if (error) {
        toast.error(error);
        return;
      }

      toast.success('Student deleted');
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
      <StudentDialog mode='edit' studentData={data}>
        <Button variant='ghost'>
          <SquarePen className='mr-2 h-4 w-4' />
        </Button>
      </StudentDialog>

      <Button variant='ghost' onClick={() => setOpen(true)}>
        <Trash2 className='mr-2 h-4 w-4 text-destructive' />
      </Button>
    </>
  );
};
