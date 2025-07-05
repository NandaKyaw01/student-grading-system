'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { GradeScale } from '@/generated/prisma';
import { useState } from 'react';
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

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[625px]'>
        <DialogHeader>
          <DialogTitle>
            {gradeScale ? `Edit Grade Scale` : 'Create New Grade Scale'}
          </DialogTitle>
          <DialogDescription className='sr-only' />
        </DialogHeader>
        <GradeScaleForm
          gradeScale={gradeScale}
          open={open}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
