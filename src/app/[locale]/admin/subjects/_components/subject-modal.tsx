'use client';

import {
  createSubject,
  SubjectWithDetails,
  updateSubject
} from '@/actions/subject';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Subject } from '@/generated/prisma';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const subjectFormSchema = (
  t: ReturnType<typeof useTranslations<'SubjectPage.form'>>
) =>
  z
    .object({
      id: z.string().min(1, {
        message: t('validation.subject_id_required')
      }),
      subjectName: z.string().min(1, {
        message: t('validation.subject_name_required')
      }),
      creditHours: z
        .union([z.string(), z.number()])
        .transform((val) => {
          const parsed = typeof val === 'string' ? parseFloat(val) : val;
          return isNaN(parsed) ? 0 : parsed;
        })
        .refine((val) => val >= 0.5, {
          message: t('validation.credit_hours_min')
        }),
      examWeight: z
        .union([z.string(), z.number()])
        .transform((val) => {
          const parsed = typeof val === 'string' ? parseFloat(val) : val;
          return isNaN(parsed) ? 0 : parsed;
        })
        .refine((val) => val >= 0 && val <= 1, {
          message: t('validation.exam_weight_range')
        }),
      assignWeight: z
        .union([z.string(), z.number()])
        .transform((val) => {
          const parsed = typeof val === 'string' ? parseFloat(val) : val;
          return isNaN(parsed) ? 0 : parsed;
        })
        .refine((val) => val >= 0 && val <= 1, {
          message: t('validation.assign_weight_range')
        })
    })
    .refine(
      (data) => {
        const total = Number(data.examWeight) + Number(data.assignWeight);
        return Math.abs(total - 1) < 0.001; // Allow for floating point precision
      },
      {
        message: t('validation.weights_sum'),
        path: ['examWeight']
      }
    );

// Define the form input type (what the form receives)
type SubjectFormInput = {
  id: string;
  subjectName: string;
  creditHours: string | number;
  examWeight: string | number;
  assignWeight: string | number;
};

// Define the form output type (what gets processed)
// type SubjectFormValues = z.infer<typeof subjectFormSchema>;

interface SubjectDialogProps {
  mode?: 'new' | 'edit';
  subject?: SubjectWithDetails | Subject;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function SubjectDialog({
  mode = 'new',
  subject,
  onSuccess,
  children
}: SubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('SubjectPage.form');

  const form = useForm<SubjectFormInput>({
    resolver: zodResolver(subjectFormSchema(t)),
    defaultValues: {
      id: '',
      subjectName: '',
      creditHours: 3.0,
      examWeight: 0.6,
      assignWeight: 0.4
    }
  });

  useEffect(() => {
    if (open && subject) {
      form.reset({
        id: subject.id || '',
        subjectName: subject.subjectName || '',
        creditHours: subject.creditHours || 3.0,
        examWeight: subject.examWeight ?? 0.6,
        assignWeight: subject.assignWeight ?? 0.4
      });
    } else if (open && !subject) {
      // Reset to default values for new subject
      form.reset({
        id: '',
        subjectName: '',
        creditHours: 3.0,
        examWeight: 0.6,
        assignWeight: 0.4
      });
    }
  }, [open, subject, form]);

  function onSubmit(data: SubjectFormInput) {
    startTransition(async () => {
      try {
        // Validate and transform the data using the schema
        const validatedData = subjectFormSchema(t).parse(data);

        let result;
        if (mode === 'new') {
          result = await createSubject(validatedData);
        } else if (subject?.id) {
          result = await updateSubject(subject.id, validatedData);
        } else {
          throw new Error('Subject ID is required for updates');
        }

        if (result?.success) {
          toast.success(t('success'), {
            description: t(
              mode === 'new' ? 'created_successfully' : 'updated_successfully'
            )
          });

          setOpen(false);
          form.reset();
          onSuccess?.();
        } else {
          toast.error(t('error'), {
            description: result?.error || t('error_occurred')
          });
        }
      } catch (error) {
        console.error('Subject operation error:', error);
        toast.error(t('error'), {
          description:
            error instanceof Error ? error.message : t('error_occurred')
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={mode === 'new' ? 'default' : 'outline'}>
            {mode === 'new' ? t('add_title') : t('edit_title')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' ? t('add_title') : t('edit_title')}
          </DialogTitle>
          <DialogDescription className='sr-only'>
            {mode === 'new' ? 'Create a new subject' : 'Edit subject details'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('subject_id')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('subject_id_placeholder')}
                      {...field}
                      disabled={mode === 'edit'} // Prevent ID changes in edit mode
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='subjectName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('subject_name')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('subject_name_placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='creditHours'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('credit_hours')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.1'
                        min='0.5'
                        // max=''
                        {...field}
                        value={
                          field.value === '' ||
                          field.value === null ||
                          field.value === undefined
                            ? ''
                            : field.value
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue =
                            value === '' ? '' : parseFloat(value);
                          field.onChange(numValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='examWeight'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('exam')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.1'
                        min='0'
                        max='1'
                        {...field}
                        value={
                          field.value === '' ||
                          field.value === null ||
                          field.value === undefined
                            ? ''
                            : field.value
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue =
                            value === '' ? '' : parseFloat(value);
                          field.onChange(numValue);
                          // Auto-adjust assignment weight
                          if (value !== '' && !isNaN(parseFloat(value))) {
                            const assignWeight = 1 - parseFloat(value);
                            form.setValue(
                              'assignWeight',
                              // Math.max(0, assignWeight)
                              Math.round(assignWeight * 100) / 100
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='assignWeight'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('assessment')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.1'
                        min='0'
                        max='1'
                        {...field}
                        value={
                          field.value === '' ||
                          field.value === null ||
                          field.value === undefined
                            ? ''
                            : field.value
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue =
                            value === '' ? '' : parseFloat(value);
                          field.onChange(numValue);
                          // Auto-adjust exam weight
                          if (value !== '' && !isNaN(parseFloat(value))) {
                            const examWeight = 1 - parseFloat(value);
                            form.setValue(
                              'examWeight',
                              // Math.max(0, examWeight)
                              Math.round(examWeight * 100) / 100
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                {t('cancel')}
              </Button>

              <Button type='submit' disabled={isPending}>
                {isPending && <Loader className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'new' ? t('create') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
