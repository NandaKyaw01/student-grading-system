'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { createGradeScale, updateGradeScale } from '@/actions/grade-scale';
import { useState } from 'react';
import { toast } from 'sonner';

const formSchema = z
  .object({
    minMark: z.number().min(0).max(100),
    maxMark: z.number().min(0).max(100),
    grade: z.string().min(1, 'Grade is required'),
    score: z.number().min(0).max(4.0)
  })
  .refine((data) => data.minMark <= data.maxMark, {
    message: 'Minimum mark must be less than or equal to maximum mark',
    path: ['minMark']
  });

interface GradeScaleFormProps {
  gradeScale?: GradeScale;
  onSuccess?: () => void;
}

export function GradeScaleForm({ gradeScale, onSuccess }: GradeScaleFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minMark: gradeScale?.minMark || undefined,
      maxMark: gradeScale?.maxMark || undefined,
      grade: gradeScale?.grade || '',
      score: gradeScale?.score || undefined
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      let result;
      if (gradeScale) {
        result = await updateGradeScale(gradeScale.id, values);
      } else {
        result = await createGradeScale(values);
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Success', {
        description: gradeScale
          ? 'Grade scale updated successfully'
          : 'Grade scale created successfully'
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Error', {
        description:
          error instanceof Error ? error.message : 'Something went wrong'
      });
    } finally {
      setLoading(false);
    }
  }

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
                    {...field}
                    value={field.value ?? ''}
                    placeholder='0-100'
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? undefined
                          : parseInt(e.target.value) || 0
                      )
                    }
                    disabled={loading}
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
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? undefined
                          : parseInt(e.target.value) || 0
                      )
                    }
                    disabled={loading}
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
                    disabled={loading}
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
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? undefined
                          : parseFloat(e.target.value) || 0
                      )
                    }
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex justify-end gap-4'>
          <Button type='submit' disabled={loading} className='w-full sm:w-auto'>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
