'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  createAcademicYear,
  updateAcademicYear
} from '@/actions/academic-year';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

// Schema for form validation
const academicYearFormSchema = z.object({
  yearRange: z.string().min(7, {
    message: "Year range must be in format 'YYYY-YYYY'"
  }),
  isCurrent: z.boolean()
});

type AcademicYearFormValues = z.infer<typeof academicYearFormSchema>;

interface AcademicYearDialogProps {
  mode?: 'new' | 'edit';
  academicYear?: {
    id: number;
    yearRange: string;
    isCurrent: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function AcademicYearDialog({
  mode = 'new',
  academicYear,
  isOpen,
  onClose
}: AcademicYearDialogProps) {
  const [isPending, startTransition] = useTransition();

  const defaultValues: Partial<AcademicYearFormValues> = {
    yearRange: academicYear?.yearRange || '',
    isCurrent: academicYear?.isCurrent || false
  };

  const form = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearFormSchema),
    defaultValues
  });

  const onSubmit = (data: AcademicYearFormValues) => {
    startTransition(async () => {
      try {
        if (mode === 'new') {
          await createAcademicYear({
            yearRange: data.yearRange,
            isCurrent: data.isCurrent
          });
        } else if (academicYear?.id) {
          await updateAcademicYear(academicYear.id, {
            yearRange: data.yearRange,
            isCurrent: data.isCurrent
          });
        }

        toast.success('Success', {
          description: `Academic year ${mode === 'new' ? 'created' : 'updated'} successfully.`
        });

        form.reset();
        setTimeout(onClose, 300);
      } catch (error) {
        toast.error('Error', {
          description:
            error instanceof Error ? error.message : 'An error occurred'
        });
      }
    });
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' ? 'Add Academic Year' : 'Edit Academic Year'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='yearRange'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year Range</FormLabel>
                  <FormControl>
                    <Input placeholder='2024-2025' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='isCurrent'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Current Year</FormLabel>
                    <p className='text-sm text-muted-foreground'>
                      Mark this as the current academic year
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && (
                  <Loader
                    className='mr-2 size-4 animate-spin'
                    aria-hidden='true'
                  />
                )}
                {mode === 'new' ? 'Create Academic Year' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
