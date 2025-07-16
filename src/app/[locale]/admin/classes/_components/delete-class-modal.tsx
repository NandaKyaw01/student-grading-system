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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('ClassPage.delete_modal');

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteClass(classData.id);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success(t('success'), {
          description: t('deleted_successfully', { className: classData.className })
        });

        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(t('error'), {
          description:
            error instanceof Error ? error.message : t('failed_to_delete')
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant='destructive' size='sm'>
            {t('delete')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description', { className: classData.className })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader className='mr-2 h-4 w-4 animate-spin' />}
            {isDeleting ? t('deleting') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
