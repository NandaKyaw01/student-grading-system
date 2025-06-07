'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Enrollment } from '@/generated/prisma';
import { EnrollmentForm } from './enrollment-form';

interface EnrollmentModalProps {
  enrollment?: Enrollment;
  children: React.ReactNode;
}

export function EnrollmentModal({
  enrollment,
  children
}: EnrollmentModalProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[625px]'>
        <DialogHeader>
          <DialogTitle>
            {enrollment ? `Edit Enrollment` : 'Create New Enrollment'}
          </DialogTitle>
        </DialogHeader>
        <EnrollmentForm enrollment={enrollment} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
