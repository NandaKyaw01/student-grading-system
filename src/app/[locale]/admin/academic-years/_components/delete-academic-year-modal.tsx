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
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('AcademicYearsPage.delete_modal');

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteAcademicYear(academicYear.id);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success(t('success'), {
          description: t('deleted_successfully', {
            yearRange: academicYear.yearRange
          })
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
            {t('description', {
              yearRange: academicYear.yearRange
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isDeleting}>
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
