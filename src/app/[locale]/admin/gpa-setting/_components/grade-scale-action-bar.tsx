'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Table } from '@tanstack/react-table';
import { GradeScale } from '@/generated/prisma';
import { deleteGradeScale } from '@/actions/grade-scale';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface GradeScalesTableActionBarProps {
  table: Table<GradeScale>;
}

export function GradeScalesTableActionBar({
  table
}: GradeScalesTableActionBarProps) {
  const router = useRouter();
  const selectedRows = table.getSelectedRowModel().rows;

  const handleBulkDelete = async () => {
    try {
      const ids = selectedRows.map((row) => row.original.id);
      const result = await Promise.all(ids.map((id) => deleteGradeScale(id)));

      if (result.some((r) => !r.success)) {
        throw new Error('Failed to delete some grade scales');
      }

      toast.success('Success', {
        description: 'Selected grade scales deleted successfully'
      });

      router.refresh();
    } catch (error) {
      toast.error('Error', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to delete grade scales'
      });
    }
  };

  return (
    <div className='flex items-center gap-2'>
      {selectedRows.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='h-8'>
              <MoreHorizontal className='mr-2 h-4 w-4' />
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              className='text-destructive'
              onClick={handleBulkDelete}
            >
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
