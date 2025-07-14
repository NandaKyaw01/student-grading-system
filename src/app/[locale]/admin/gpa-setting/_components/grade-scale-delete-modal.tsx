'use client';

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

interface DeleteGradeScaleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDeleting: boolean;
  handleDelete: () => void;
}

export function DeleteGradeScaleDialog({
  isOpen,
  onClose,
  isDeleting,
  handleDelete
}: DeleteGradeScaleDialogProps) {
  const t = useTranslations('GpaSettingPage.delete_modal');
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
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
