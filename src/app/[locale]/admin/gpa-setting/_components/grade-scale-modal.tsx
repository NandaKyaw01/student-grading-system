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
import { GradeScale } from '@/generated/prisma';
import { GradeScaleForm } from './grade-scale-form';

interface GradeScaleModalProps {
  gradeScale?: GradeScale;
  children: React.ReactNode;
}

export function GradeScaleModal({
  gradeScale,
  children
}: GradeScaleModalProps) {
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
            {gradeScale ? `Edit Grade Scale` : 'Create New Grade Scale'}
          </DialogTitle>
        </DialogHeader>
        <GradeScaleForm gradeScale={gradeScale} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
