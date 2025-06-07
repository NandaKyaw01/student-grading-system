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
import { Enrollment } from '@/generated/prisma';
import {
  EnrollmentWithDetails,
  updateEnrollmentStatus
} from '@/actions/enrollment';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EnrollmentModal } from './enrollment-modal';

interface EnrollmentsTableActionBarProps {
  table: Table<EnrollmentWithDetails>;
}

export function EnrollmentsTableActionBar({
  table
}: EnrollmentsTableActionBarProps) {
  const router = useRouter();
  const selectedRows = table.getSelectedRowModel().rows;

  const handleBulkStatusChange = async (status: boolean) => {
    try {
      const ids = selectedRows.map((row) => row.original.id);
      const result = await updateEnrollmentStatus(ids, status);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Success', {
        description: status
          ? 'Selected enrollments activated'
          : 'Selected enrollments deactivated'
      });

      router.refresh();
    } catch (error) {
      toast.error('Error', {
        description:
          error instanceof Error ? error.message : 'Failed to update status'
      });
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <EnrollmentModal>
        <Button size='sm' className='h-8'>
          New Enrollment
        </Button>
      </EnrollmentModal>

      {selectedRows.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='h-8'>
              <MoreHorizontal className='mr-2 h-4 w-4' />
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => handleBulkStatusChange(true)}>
              Activate Selected
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkStatusChange(false)}>
              Deactivate Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
