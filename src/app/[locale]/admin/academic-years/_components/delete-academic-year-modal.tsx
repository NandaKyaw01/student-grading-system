'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { deleteAcademicYear } from '@/actions/academic-year';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeleteAcademicYearDialogProps {
  academicYear: {
    id: number;
    yearRange: string;
  };
  children?: React.ReactNode;
}

export function DeleteAcademicYearDialog({
  academicYear,
  children
}: DeleteAcademicYearDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAcademicYear(academicYear.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Success', {
        description: `Academic year ${academicYear.yearRange} deleted successfully.`
      });

      setOpen(false);
      router.refresh(); // Refresh the page to update the list
    } catch (error) {
      toast.error('Error', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to delete academic year'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant='destructive' size='sm'>
            Delete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Academic Year</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the academic year &#34;
            {academicYear.yearRange}&#34;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
