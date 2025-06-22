'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  createSemester,
  SemesterWithDetails,
  updateSemester
} from '@/actions/semester';
import { toast } from 'sonner';
import {
  useEffect,
  useState,
  useTransition,
  useCallback,
  useMemo,
  use
} from 'react';
import { getAcademicYears } from '@/actions/academic-year';
import { AcademicYear } from '@/generated/prisma';

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
  academicYear: Promise<Awaited<ReturnType<typeof getAcademicYears>>>;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function SemesterDialog({
  mode = 'new',
  semester,
  academicYear,
  onSuccess,
  children
}: SemesterDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { years: academicYears, pageCount } = use(academicYear);

  const defaultValues: Partial<SemesterFormValues> = useMemo(() => {
    return {
      semesterName: semester?.semesterName || '',
      academicYearId: semester?.academicYearId.toString() || '',
      isCurrent: semester?.isCurrent || false
    };
  }, [semester?.semesterName, semester?.academicYearId, semester?.isCurrent]);

  const form = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues
  });

  // Reset form when semester prop changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, semester, form, defaultValues]);

  const onSubmit = useCallback(
    async (data: SemesterFormValues) => {
      startTransition(async () => {
        try {
          const payload = {
            semesterName: data.semesterName,
            academicYearId: parseInt(data.academicYearId),
            isCurrent: data.isCurrent
          };

          if (mode === 'new') {
            await createSemester(payload);
          } else if (semester?.id) {
            await updateSemester(semester.id, payload);
          }

          toast.success('Success', {
            description: `Semester ${mode === 'new' ? 'created' : 'updated'} successfully.`
          });

          setOpen(false);
          if (onSuccess) onSuccess();
        } catch (error) {
          toast.error('Error', {
            description:
              error instanceof Error ? error.message : 'An error occurred'
          });
        }
      });
    },
    [mode, semester?.id, onSuccess]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={mode === 'new' ? 'default' : 'outline'}>
            {mode === 'new' ? 'Add Semester' : 'Edit'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' ? 'Add New Semester' : 'Edit Semester'}
          </DialogTitle>
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
                    <Input placeholder='e.g., 1st Semester' {...field} />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isPending ? 'Loading...' : 'Select academic year'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id.toString()}>
                          {year.yearRange}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <FormLabel className='text-base'>
                      Current Semester
                    </FormLabel>
                    <p className='text-sm text-muted-foreground'>
                      Mark this as the current semester
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

            <Button type='submit' disabled={isPending}>
              {isPending
                ? 'Saving...'
                : mode === 'new'
                  ? 'Create Semester'
                  : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
