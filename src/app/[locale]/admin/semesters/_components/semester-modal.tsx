'use client';

import {
  createSemester,
  SemesterWithDetails,
  updateSemester
} from '@/actions/semester';
import { Combobox } from '@/components/combo-box';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AcademicYear } from '@/generated/prisma';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const semesterFormSchema = z.object({
  semesterName: z.string().min(1, {
    message: 'Semester name is required'
  }),
  academicYearId: z.string().min(1, {
    message: 'Academic year is required'
  }),
  isCurrent: z.boolean()
});

type SemesterFormValues = z.infer<typeof semesterFormSchema>;

interface SemesterDialogProps {
  mode?: 'new' | 'edit';
  semester?: SemesterWithDetails;
  academicYear: AcademicYear[];
  isOpen: boolean;
  onClose: () => void;
}

export function SemesterDialog({
  mode = 'new',
  semester,
  academicYear,
  isOpen,
  onClose
}: SemesterDialogProps) {
  const [isPending, startTransition] = useTransition();

  const defaultValues: Partial<SemesterFormValues> = {
    semesterName: semester?.semesterName || '',
    academicYearId: semester?.academicYearId.toString() || '',
    isCurrent: semester?.isCurrent || false
  };

  const form = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        semesterName: semester?.semesterName || '',
        academicYearId: semester?.academicYearId.toString() || '',
        isCurrent: semester?.isCurrent || false
      });
    }
  }, [isOpen, semester, form]);

  const onSubmit = (data: SemesterFormValues) => {
    startTransition(async () => {
      try {
        const payload = {
          semesterName: data.semesterName,
          academicYearId: parseInt(data.academicYearId),
          isCurrent: data.isCurrent
        };

        let result;
        if (mode === 'new') {
          result = await createSemester(payload);
        } else if (semester?.id) {
          result = await updateSemester(semester.id, payload);
        }

        if (!result?.success) {
          throw new Error(result?.error);
        }

        toast.success('Success', {
          description: `Semester ${mode === 'new' ? 'created' : 'updated'} successfully.`
        });
        form.reset();
        onClose();
      } catch (error) {
        toast.error('Error', {
          description:
            error instanceof Error ? error.message : 'An error occurred'
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' ? 'Add New Semester' : 'Edit Semester'}
          </DialogTitle>
          <DialogDescription className='sr-only' />
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='semesterName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., First Semester' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='academicYearId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Year</FormLabel>

                  <Combobox
                    options={academicYear.map((s) => ({
                      value: s.id.toString(),
                      label: `${s.yearRange} ${s.isCurrent ? '(Current)' : ''}`
                    }))}
                    value={field.value?.toString() || ''}
                    onValueChange={field.onChange}
                    placeholder='Select year...'
                    searchPlaceholder='Search year...'
                    disabled={isPending}
                  />
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
                    <FormLabel className='text-base' htmlFor='current-semester'>
                      Current Semester
                    </FormLabel>
                    <p className='text-sm text-muted-foreground'>
                      Mark this as the current semester
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      id='current-semester'
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
                {isPending
                  ? 'Saving...'
                  : mode === 'new'
                    ? 'Create Semester'
                    : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
