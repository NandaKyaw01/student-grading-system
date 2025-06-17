'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { GradeScale } from '@/generated/prisma';
import { deleteGradeScale } from '@/actions/grade-scale';
import { useRouter } from 'next/navigation';
import { GradeScaleModal } from './grade-scale-modal';
import { toast } from 'sonner';

interface GradeScaleCellActionProps {
  data: GradeScale;
}

export function GradeScaleCellAction({ data }: GradeScaleCellActionProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const result = await deleteGradeScale(data.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast('Success', {
        description: 'Grade scale deleted successfully'
      });
      router.refresh();
    } catch (error) {
      toast.error('Error', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to delete grade scale'
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
        <GradeScaleModal gradeScale={data}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
        </GradeScaleModal>
        <DropdownMenuItem className='text-destructive' onClick={handleDelete}>
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
