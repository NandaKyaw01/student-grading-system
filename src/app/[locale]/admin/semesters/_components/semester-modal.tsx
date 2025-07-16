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
import { Switch } from '@/components/ui/switch';
import { AcademicYear } from '@/generated/prisma';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const semesterFormSchema = (
  t: ReturnType<typeof useTranslations<'SemestersPage.form'>>
) =>
  z.object({
    semesterName: z.string().min(1, {
      message: t('validation.semester_name_required')
    }),
    academicYearId: z.string().min(1, {
      message: t('validation.academic_year_required')
    }),
    isCurrent: z.boolean()
  });

type SemesterFormValues = z.infer<ReturnType<typeof semesterFormSchema>>;

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
  const t = useTranslations('SemestersPage.form');

  const defaultValues: Partial<SemesterFormValues> = {
    semesterName: semester?.semesterName || '',
    academicYearId: semester?.academicYearId.toString() || '',
    isCurrent: semester?.isCurrent || false
  };

  const form = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterFormSchema(t)),
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

        toast.success(t('success'), {
          description: t(
            mode === 'new' ? 'created_successfully' : 'updated_successfully'
          )
        });
        form.reset();
        onClose();
      } catch (error) {
        toast.error(t('error'), {
          description:
            error instanceof Error ? error.message : t('error_occurred')
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' ? t('add_title') : t('edit_title')}
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
                  <FormLabel>{t('semester_name')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('semester_name_placeholder')}
                      {...field}
                    />
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
                  <FormLabel>{t('academic_year')}</FormLabel>

                  <Combobox
                    options={academicYear.map((s) => ({
                      value: s.id.toString(),
                      label: `${s.yearRange} ${s.isCurrent ? `(${t('current')})` : ''}`
                    }))}
                    value={field.value?.toString() || ''}
                    onValueChange={field.onChange}
                    placeholder={t('select_year_placeholder')}
                    searchPlaceholder={t('search_year_placeholder')}
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
                      {t('current_semester')}
                    </FormLabel>
                    <p className='text-sm text-muted-foreground'>
                      {t('mark_as_current')}
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
                {t('cancel')}
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && (
                  <Loader
                    className='mr-2 size-4 animate-spin'
                    aria-hidden='true'
                  />
                )}
                {isPending
                  ? t('saving')
                  : mode === 'new'
                    ? t('create')
                    : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
