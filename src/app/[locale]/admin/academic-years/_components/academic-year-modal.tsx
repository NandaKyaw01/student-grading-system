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
import { Loader } from 'lucide-react';
import { useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('AcademicYearsPage.form');

  const academicYearFormSchema = z.object({
    yearRange: z.string().min(7, {
      message: t('validation.year_range_required')
    }),
    isCurrent: z.boolean()
  });

  type AcademicYearFormValues = z.infer<typeof academicYearFormSchema>;

  const defaultValues: Partial<AcademicYearFormValues> = {
    yearRange: academicYear?.yearRange || '',
    isCurrent: academicYear?.isCurrent || false
  };

  const form = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearFormSchema),
    defaultValues
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        yearRange: academicYear?.yearRange || '',
        isCurrent: academicYear?.isCurrent || false
      });
    }
  }, [isOpen, academicYear, form]);

  const onSubmit = (data: AcademicYearFormValues) => {
    startTransition(async () => {
      try {
        let result;
        if (mode === 'new') {
          result = await createAcademicYear({
            yearRange: data.yearRange,
            isCurrent: data.isCurrent
          });
        } else if (academicYear?.id) {
          result = await updateAcademicYear(academicYear.id, {
            yearRange: data.yearRange,
            isCurrent: data.isCurrent
          });
        }

        if (!result?.success) {
          throw new Error(result?.error);
        }

        toast.success(t('success'), {
          description: t(mode === 'new' ? 'created_successfully' : 'updated_successfully')
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
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='yearRange'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('year_range')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('year_range_placeholder')} {...field} />
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
                    <FormLabel className='text-base'>{t('current_year')}</FormLabel>
                    <p className='text-sm text-muted-foreground'>
                      {t('mark_as_current')}
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
                {t('cancel')}
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && (
                  <Loader
                    className='mr-2 size-4 animate-spin'
                    aria-hidden='true'
                  />
                )}
                {mode === 'new' ? t('create') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
