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
import { deleteClass } from '@/actions/class';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

interface DeleteClassDialogProps {
  classData: {
    id: number;
    className: string;
  };
  children?: React.ReactNode;
}

export function DeleteClassDialog({
  classData,
  children
}: DeleteClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteClass(classData.id);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success('Success', {
          description: `Class "${classData.className}" deleted successfully.`
        });

        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error('Error', {
          description:
            error instanceof Error ? error.message : 'Failed to delete class'
        });
      }
    });
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
          <DialogTitle>Delete Class</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the class &#34;{classData.className}
            &#34;? This action cannot be undone.
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
            {isDeleting && <Loader className='mr-2 h-4 w-4 animate-spin' />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
