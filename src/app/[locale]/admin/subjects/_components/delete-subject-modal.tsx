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
import { deleteSubject } from '@/actions/subject';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { useTranslations } from 'next-intl';
import { Loader } from 'lucide-react';

interface DeleteSubjectDialogProps {
  subject: {
    id: string;
    subjectName: string;
  };
  children?: React.ReactNode;
}

export function DeleteSubjectDialog({
  subject,
  children
}: DeleteSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const t = useTranslations('SubjectPage.delete_modal');

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSubject(subject.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(t('success'), {
        description: t('deleted_successfully', {
          subjectName: subject.subjectName
        })
      });

      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(t('error'), {
        description:
          error instanceof Error ? error.message : t('failed_to_delete')
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
            {t('delete')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description', { subjectName: subject.subjectName })}
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
