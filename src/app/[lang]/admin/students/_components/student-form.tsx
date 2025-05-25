'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  CreateStudentInput,
  createStudentSchema,
  UpdateStudentInput
} from '@/lib/zod-schemas/student-schema';
import { use, useMemo, useTransition } from 'react';
import { Loader } from 'lucide-react';
import { createStudent, updateStudent } from '@/actions/student';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getAllClasses } from '@/services/class';
import { getAllAcademicYears } from '@/services/academic-year';

export default function StudentForm({
  initialData,
  pageTitle,
  promises
}: {
  initialData: Partial<UpdateStudentInput> | null;
  pageTitle: string;
  promises: Promise<
    [
      Awaited<ReturnType<typeof getAllClasses>>,
      Awaited<ReturnType<typeof getAllAcademicYears>>
    ]
  >;
}) {
  const [{ classes }, { academicYears }] = use(promises);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const classOptions = useMemo(
    () =>
      classes.map((cls) => ({
        id: cls.id,
        name: cls.className
      })),
    [classes]
  );
  const academicYearOptions = useMemo(
    () =>
      academicYears.map((year) => ({
        id: year.id,
        name: year.year
      })),
    [academicYears]
  );

  const form = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: initialData || {
      name: '',
      rollNumber: '',
      classId: '',
      academicYearId: ''
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
              name='name'
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
              name='rollNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll Number</FormLabel>
                  <FormControl>
                    <Input placeholder='Roll Number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='classId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a class' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
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
              name='academicYearId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Year</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select academic year' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYearOptions.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
