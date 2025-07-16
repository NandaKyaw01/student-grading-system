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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('SemestersPage.delete_modal');

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteSemester(semester.id);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success(t('success'), {
          description: t('deleted_successfully', { semesterName: semester.semesterName })
        });
      } catch (error) {
        toast.error(t('error'), {
          description:
            error instanceof Error ? error.message : t('failed_to_delete')
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description', { semesterName: semester.semesterName, yearRange: semester.academicYear.yearRange })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && (
              <Loader className='mr-2 size-4 animate-spin' aria-hidden='true' />
            )}
            {isDeleting ? t('deleting') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
