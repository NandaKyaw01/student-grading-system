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
import { deleteSemester } from '@/actions/semester';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeleteSemesterDialogProps {
  semester: {
    id: number;
    semesterName: string;
    academicYear: {
      yearRange: string;
    };
  };
  children?: React.ReactNode;
}

export function DeleteSemesterDialog({
  semester,
  children
}: DeleteSemesterDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSemester(semester.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Success', {
        description: `Semester "${semester.semesterName}" deleted successfully.`
      });

      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('Error', {
        description:
          error instanceof Error ? error.message : 'Failed to delete semester'
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
          <DialogTitle>Delete Semester</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the semester &#34;
            {semester.semesterName}&#34; for academic year{' '}
            {semester.academicYear.yearRange}? This action cannot be undone.
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
