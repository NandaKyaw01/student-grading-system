'use client';

import { EnrollmentWithDetails } from '@/actions/enrollment';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useState } from 'react';
import { EnrollmentForm } from './enrollment-form';
import { useTranslations } from 'next-intl';

interface EnrollmentModalProps {
  enrollment?: EnrollmentWithDetails;
  children: React.ReactNode;
}

export function EnrollmentModal({
  enrollment,
  children
}: EnrollmentModalProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('EnrollmentsPage.EnrollmentModal');

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[625px]'>
        <DialogHeader>
          <DialogTitle>
            {enrollment ? t('edit_enrollment') : t('create_enrollment')}
          </DialogTitle>
          <DialogDescription className='sr-only' />
        </DialogHeader>
        <EnrollmentForm enrollment={enrollment} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
