'use client';

import { deleteAcademicYear } from '@/actions/academic-year';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Loader } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

interface DeleteAcademicYearDialogProps {
  academicYear: {
    id: number;
    yearRange: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAcademicYearDialog({
  academicYear,
  isOpen,
  onClose
}: DeleteAcademicYearDialogProps) {
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteAcademicYear(academicYear.id);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success('Success', {
          description: `Academic year ${academicYear.yearRange} deleted successfully.`
        });
      } catch (error) {
        toast.error('Error', {
          description:
            error instanceof Error
              ? error.message
              : 'Failed to delete academic year'
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Academic Year</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the academic year &#34;
            {academicYear.yearRange}&#34;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && (
              <Loader className='mr-2 size-4 animate-spin' aria-hidden='true' />
            )}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
