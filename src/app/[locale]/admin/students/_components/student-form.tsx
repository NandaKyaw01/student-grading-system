'use client';

import { createStudent, updateStudent } from '@/actions/student';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export const createStudentSchema = z.object({
  studentName: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' }),
  admissionId: z.string().min(6, {
    message: 'Admission ID must be at least 2 characters'
  })
});

export const updateStudentSchema = z.object({
  id: z.number().min(1, { message: 'ID is required' }),
  studentName: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' }),
  admissionId: z.string().min(6, {
    message: 'Admission ID must be at least 2 characters'
  })
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export default function StudentForm({
  initialData,
  pageTitle
}: {
  initialData: Partial<UpdateStudentInput> | null;
  pageTitle: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: initialData || {
      studentName: '',
      admissionId: ''
    }
  });

  const onSubmit = (values: CreateStudentInput) => {
    startTransition(async () => {
      let error: string | null = null;

      if (initialData?.id) {
        const res = await updateStudent({ id: initialData.id, ...values });
        error = res.error;
      } else {
        const res = await createStudent(values);
        error = res.error;
      }

      if (error) {
        toast.error(error);
        return;
      }

      router.push('/admin/students');
      toast.success(
        initialData?.id
          ? 'Student updated successfully'
          : 'Student created successfully'
      );
    });
  };

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 max-w-md'
          >
            <FormField
              control={form.control}
              name='studentName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Student Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='admissionId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admission ID</FormLabel>
                  <FormControl>
                    <Input placeholder='Admission ID' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' disabled={isPending}>
              {isPending && <Loader className='animate-spin' />}
              Save Student
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
