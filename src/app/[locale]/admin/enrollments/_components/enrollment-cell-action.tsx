'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Enrollment } from '@/generated/prisma';
import { deleteEnrollment } from '@/actions/enrollment';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EnrollmentModal } from './enrollment-modal';

interface EnrollmentCellActionProps {
  data: Enrollment;
}

export function EnrollmentCellAction({ data }: EnrollmentCellActionProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const result = await deleteEnrollment(data.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Success', {
        description: 'Enrollment deleted successfully'
      });
      router.refresh();
    } catch (error) {
      toast.error('Error', {
        description:
          error instanceof Error ? error.message : 'Failed to delete enrollment'
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <EnrollmentModal enrollment={data}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
        </EnrollmentModal>
        <DropdownMenuItem className='text-destructive' onClick={handleDelete}>
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
