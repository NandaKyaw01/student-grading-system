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
import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z, ZodSchema } from 'zod';

const markSchema = (minMark: number, maxMark: number) =>
  z
    .union([
      z
        .string()
        .min(1, 'This field is required')
        .transform((val) => parseFloat(val)),
      z.number()
    ])
    .refine((val) => !isNaN(val), { message: 'Must be a valid number' })
    .refine((val) => val >= minMark, { message: 'Must be 0 or greater' })
    .refine((val) => val <= maxMark, { message: `Must be ${maxMark} or less` });

const formSchema = z
  .object({
    minMark: markSchema(0, 100),
    maxMark: markSchema(0, 100),
    grade: z.string().min(1, 'Grade is required'),
    score: markSchema(0, 4.0)
  })
  .refine((data) => Number(data.minMark) <= Number(data.maxMark), {
    message: 'Minimum mark must be less than or equal to maximum mark',
    path: ['minMark']
  });

interface GradeScaleFormProps {
  gradeScale?: GradeScale;
  onSuccess?: () => void;
  open: boolean;
}

type FormValues = {
  minMark: number;
  maxMark: number;
  grade: string;
  score: number;
};

export function GradeScaleForm({
  gradeScale,
  onSuccess,
  open
}: GradeScaleFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema as unknown as ZodSchema<FormValues>),
    defaultValues: {
      minMark: gradeScale?.minMark ?? undefined,
      maxMark: gradeScale?.maxMark ?? undefined,
      grade: gradeScale?.grade ?? '',
      score: gradeScale?.score ?? undefined
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        minMark: gradeScale?.minMark ?? undefined,
        maxMark: gradeScale?.maxMark ?? undefined,
        grade: gradeScale?.grade ?? '',
        score: gradeScale?.score ?? undefined
      });
    }
  }, [open, gradeScale, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        const processedValues = {
          ...values,
          minMark: Number(values.minMark),
          maxMark: Number(values.maxMark),
          score: parseFloat(values.score.toFixed(2))
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

        toast.success('Success', {
          description: gradeScale
            ? 'Grade scale updated successfully'
            : 'Grade scale created successfully'
        });

        onSuccess?.();
      } catch (error) {
        toast.error('Error', {
          description:
            error instanceof Error ? error.message : 'Something went wrong'
        });
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
                <FormLabel>Minimum Mark</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min='0'
                    max='100'
                    placeholder='0-100'
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
                <FormLabel>Maximum Mark</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min='0'
                    max='100'
                    placeholder='0-100'
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
                <FormLabel>Grade</FormLabel>
                <FormControl>
                  <Input
                    placeholder='A, B, C, etc.'
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
                <FormLabel>Score</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    step='0.01'
                    min='0'
                    max='4.00'
                    placeholder='0.00-4.00'
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
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isPending}
            className='w-full sm:w-auto'
          >
            {isPending && (
              <Loader className='mr-2 size-4 animate-spin' aria-hidden='true' />
            )}

            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
