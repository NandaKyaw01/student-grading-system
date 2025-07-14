'use client';

import { createGradeScale, updateGradeScale } from '@/actions/grade-scale';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { GradeScale } from '@/generated/prisma';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type SchemaKeys = ReturnType<typeof useTranslations<'GpaSettingPage.form'>>;
const markSchema = (minMark: number, maxMark: number, t: SchemaKeys) =>
  z
    .union([
      z
        .string()
        .min(1, t('field_required'))
        .transform((val) => parseFloat(val)),
      z.number().min(1, t('field_required'))
    ])
    .refine((val) => !isNaN(val), {
      message: t('must_be_number')
    })
    .refine((val) => val >= minMark, {
      message: t('must_be_greater_than_0')
    })
    .refine((val) => val <= maxMark, {
      message: t('must_be_less_than_100')
    });

const formSchema = (t: SchemaKeys) =>
  z
    .object({
      minMark: markSchema(0, 100, t),
      maxMark: markSchema(0, 100, t),
      grade: z.string().min(1, t('grade_required')),
      score: markSchema(0, 4.0, t)
    })
    .refine((data) => Number(data.minMark) <= Number(data.maxMark), {
      message: t('min_mark_less_than_max_mark'),
      path: ['minMark']
    });

interface GradeScaleFormProps {
  gradeScale?: GradeScale;
  onSuccess?: () => void;
  open: boolean;
}

type FormValues = {
  minMark: number | string;
  maxMark: number | string;
  grade: string;
  score: number | string;
};

export function GradeScaleForm({
  gradeScale,
  onSuccess,
  open
}: GradeScaleFormProps) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('GpaSettingPage.form');

  const currentFormSchema = formSchema(t);

  const form = useForm<FormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      minMark: gradeScale?.minMark ?? 'undefined',
      maxMark: gradeScale?.maxMark ?? 'undefined',
      grade: gradeScale?.grade ?? '',
      score: gradeScale?.score ?? 'undefined'
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        minMark: gradeScale?.minMark ?? 'undefined',
        maxMark: gradeScale?.maxMark ?? 'undefined',
        grade: gradeScale?.grade ?? '',
        score: gradeScale?.score ?? 'undefined'
      });
    }
  }, [open, gradeScale, form]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const validatedData = currentFormSchema.parse(values);
        const processedValues = {
          ...values,
          minMark: Number(validatedData.minMark),
          maxMark: Number(validatedData.maxMark),
          score: parseFloat(validatedData.score.toFixed(2))
        };

        let result;
        if (gradeScale) {
          result = await updateGradeScale(gradeScale.id, processedValues);
        } else {
          result = await createGradeScale(processedValues);
        }

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success(gradeScale ? t('update_success') : t('create_success'));

        onSuccess?.();
      } catch (error) {
        toast.error(t('something_went_wrong'));
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='minMark'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('min_mark_label')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min='0'
                    max='100'
                    placeholder={t('min_mark_placeholder')}
                    {...field}
                    value={field.value ?? ''}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='maxMark'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('max_mark_label')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min='0'
                    max='100'
                    placeholder={t('max_mark_placeholder')}
                    {...field}
                    value={field.value ?? ''}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='grade'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('grade_label')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('grade_placeholder')}
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='score'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('score_label')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    step='0.01'
                    min='0'
                    max='4.00'
                    placeholder={t('score_placeholder')}
                    {...field}
                    value={field.value ?? ''}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex justify-end gap-4'>
          <Button
            type='button'
            variant='outline'
            onClick={onSuccess}
            disabled={isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            type='submit'
            disabled={isPending}
            className='w-full sm:w-auto'
          >
            {isPending && (
              <Loader className='mr-2 size-4 animate-spin' aria-hidden='true' />
            )}

            {isPending ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
