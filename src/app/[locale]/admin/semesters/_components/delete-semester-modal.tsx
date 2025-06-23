'use client';

import { deleteSemester } from '@/actions/semester';
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

interface DeleteSemesterDialogProps {
  semester: {
    id: number;
    semesterName: string;
    academicYear: {
      yearRange: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteSemesterDialog({
  semester,
  isOpen,
  onClose
}: DeleteSemesterDialogProps) {
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteSemester(semester.id);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success('Success', {
          description: `Semester "${semester.semesterName}" deleted successfully.`
        });
      } catch (error) {
        toast.error('Error', {
          description:
            error instanceof Error ? error.message : 'Failed to delete semester'
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button variant='outline' onClick={onClose}>
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
